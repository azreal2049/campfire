param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('Setup', 'Send')]
  [string]$Mode
)

$ErrorActionPreference = 'Stop'
$channelId = '1567358109020586057'
$configDirectory = Join-Path $env:LOCALAPPDATA 'Campfire\DiscordUpdates'
$configPath = Join-Path $configDirectory 'config.json'

function Convert-SecureStringToPlainText {
  param([System.Security.SecureString]$Value)

  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

function Invoke-DiscordRequest {
  param(
    [string]$Method,
    [string]$Uri,
    [byte[]]$Body
  )

  try {
    if ($Method -eq 'Post') {
      Invoke-RestMethod `
        -UseBasicParsing `
        -Method Post `
        -Uri $Uri `
        -ContentType 'application/json; charset=utf-8' `
        -Body $Body `
        -TimeoutSec 20 | Out-Null
    } else {
      return Invoke-RestMethod -UseBasicParsing -Method Get -Uri $Uri -TimeoutSec 20
    }
  } catch {
    $status = 'network error'
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      $status = [string][int]$_.Exception.Response.StatusCode
    }
    throw "Discord request failed (HTTP $status). Webhook details were withheld."
  }
}

function Assert-WebhookChannel {
  param([string]$WebhookUrl)

  if ($WebhookUrl -notmatch '^https://discord\.com/api/webhooks/\d+/[\w-]+/?$') {
    throw 'The webhook URL is not a standard Discord webhook URL.'
  }

  $webhook = Invoke-DiscordRequest -Method Get -Uri $WebhookUrl
  if ([string]$webhook.channel_id -ne $channelId) {
    throw "This webhook posts to channel $($webhook.channel_id), not #commits ($channelId). No message was sent."
  }
}

function Get-RepositoryHead {
  $repository = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
  $head = & git -C $repository rev-parse --verify HEAD 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $head) {
    throw 'Could not read the repository HEAD commit.'
  }

  return @{
    Path = $repository
    Sha = ([string]$head).Trim()
  }
}

function Save-Config {
  param([object]$Config)

  New-Item -ItemType Directory -Path $configDirectory -Force | Out-Null
  $temporaryPath = "$configPath.tmp"
  $Config | ConvertTo-Json | Set-Content -LiteralPath $temporaryPath -Encoding UTF8
  Move-Item -LiteralPath $temporaryPath -Destination $configPath -Force
}

function Set-UpWebhook {
  $secureUrl = Read-Host -AsSecureString -Prompt 'Paste the NEW, rotated #commits webhook URL (input is hidden)'
  if ($secureUrl.Length -eq 0) {
    throw 'A webhook URL is required.'
  }

  $webhookUrl = Convert-SecureStringToPlainText -Value $secureUrl
  Assert-WebhookChannel -WebhookUrl $webhookUrl

  $repository = Get-RepositoryHead
  $lastSentCommit = $repository.Sha
  if (Test-Path -LiteralPath $configPath -PathType Leaf) {
    try {
      $existingConfig = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
      if ($existingConfig.lastSentCommit) {
        & git -C $repository.Path merge-base --is-ancestor $existingConfig.lastSentCommit $repository.Sha 2>$null
        if ($LASTEXITCODE -eq 0) {
          $lastSentCommit = [string]$existingConfig.lastSentCommit
        }
      }
    } catch {
      Write-Output 'Previous update state could not be reused; initializing from the current commit.'
    }
  }

  $config = [ordered]@{
    webhook = ConvertFrom-SecureString -SecureString $secureUrl
    lastSentCommit = ([string]$lastSentCommit).Trim()
  }
  Save-Config -Config $config

  Write-Output 'Setup complete. The webhook is encrypted for this Windows account and stored outside the repository.'
  Write-Output 'Use npm run discord-updates whenever you want to send a new on-demand #commits update.'
}

function Get-CommitSummary {
  param(
    [string]$Repository,
    [string]$Sha
  )

  $metadata = & git -C $Repository show -s '--format=%H%x1f%ad%x1f%s' --date=short $Sha 2>$null
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not read commit metadata.'
  }

  $parts = ([string]$metadata).Trim() -split [char]31, 3
  $numstat = & git -C $Repository show '--format=' --numstat $Sha 2>$null
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not read commit statistics.'
  }

  $fileCount = 0
  $lineCount = 0
  foreach ($line in $numstat) {
    if ([string]::IsNullOrWhiteSpace($line)) {
      continue
    }

    $columns = $line -split "`t", 3
    if ($columns.Count -lt 3) {
      continue
    }

    $fileCount++
    $added = 0
    $deleted = 0
    [void][int]::TryParse($columns[0], [ref]$added)
    [void][int]::TryParse($columns[1], [ref]$deleted)
    $lineCount += $added + $deleted
  }

  if ($parts.Count -lt 3) {
    throw 'Could not parse commit metadata.'
  }

  return @{
    Sha = $parts[0]
    Date = $parts[1]
    Subject = $parts[2]
    Files = $fileCount
    ChangedLines = $lineCount
  }
}

function Send-CommitUpdate {
  if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
    throw 'Discord is not set up yet. Run npm run discord-updates:setup once first.'
  }

  $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
  try {
    $secureUrl = ConvertTo-SecureString -String $config.webhook
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureUrl)
    try {
      $webhookUrl = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    } finally {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
  } catch {
    throw 'Could not decrypt the saved webhook for this Windows account. Run setup again.'
  }

  Assert-WebhookChannel -WebhookUrl $webhookUrl
  $repository = Get-RepositoryHead
  $lastSha = [string]$config.lastSentCommit
  if (-not $lastSha) {
    throw 'The previous-update commit is missing. Run setup again to initialize it safely.'
  }

  & git -C $repository.Path merge-base --is-ancestor $lastSha $repository.Sha 2>$null
  if ($LASTEXITCODE -ne 0) {
    throw 'The saved update baseline is not in the current Git history. Run setup again.'
  }

  $commitShas = @(& git -C $repository.Path rev-list --reverse "$lastSha..$($repository.Sha)" 2>$null)
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not list commits since the last update.'
  }

  $largeCommits = @()
  foreach ($sha in $commitShas) {
    $commit = Get-CommitSummary -Repository $repository.Path -Sha ([string]$sha)
    if ($commit.Files -ge 3 -or $commit.ChangedLines -ge 100) {
      $largeCommits += $commit
    }
  }

  if ($largeCommits.Count -eq 0) {
    $config.lastSentCommit = $repository.Sha
    Save-Config -Config $config
    Write-Output 'No large committed changes since the last update. Nothing was posted.'
    return
  }

  $fields = @()
  for ($index = 0; $index -lt $largeCommits.Count; $index++) {
    $commit = $largeCommits[$index]
    $subject = $commit.Subject
    if ($subject.Length -gt 220) {
      $subject = $subject.Substring(0, 217) + '...'
    }

    $fields += @{
      name = ('{0:D2} | `{1}` | {2}' -f `
      ($index + 1), `
      $commit.Sha.Substring(0, 7), `
      $commit.Date)
      value = "**$subject**`n`n📄 $($commit.Files) files changed · ✏️ $($commit.ChangedLines) lines"
      inline = $false
    }
  }

  $fileTotal = ($largeCommits | Measure-Object -Property Files -Sum).Sum
  $lineTotal = ($largeCommits | Measure-Object -Property ChangedLines -Sum).Sum
  $embed = @{
    title = '🔥 Campfire | Project Update'
    description = 'A quick, readable look at the latest noteworthy committed changes.'
    fields = $fields
    color = 0xE87532
    footer = @{
      text = "$($largeCommits.Count) major commits · $fileTotal files · $lineTotal lines · $((Get-Date).ToString('MMM d, yyyy'))"
    }
  }
  $payload = @{
    embeds = @($embed)
    allowed_mentions = @{ parse = @() }
  }
  $json = $payload | ConvertTo-Json -Depth 6 -Compress
  Invoke-DiscordRequest `
    -Method Post `
    -Uri ($webhookUrl + '?wait=true') `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($json))

  $config.lastSentCommit = $repository.Sha
  Save-Config -Config $config
  Write-Output "Posted $($largeCommits.Count) major commit(s) to #commits."
}

if ($Mode -eq 'Setup') {
  Set-UpWebhook
} else {
  Send-CommitUpdate
}
