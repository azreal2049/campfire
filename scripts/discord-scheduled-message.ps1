param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('CommitDigest', 'GoodMorning', 'GoodNight')]
  [string]$Mode
)

$ErrorActionPreference = 'Stop'
$configPath = Join-Path $env:LOCALAPPDATA 'Campfire\DiscordSchedule\config.json'
$logDirectory = Join-Path $env:LOCALAPPDATA 'Campfire\DiscordSchedule\logs'
$logPath = Join-Path $logDirectory "$((Get-Date).ToString('yyyy-MM-dd')).log"
$commitsChannelId = '1567358109020586057'
$greetingsChannelId = '1567719634830893126'
$svjUserId = '1323996767095885830'

function Write-ScheduleLog {
  param([string]$Message)

  New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
  Add-Content -LiteralPath $logPath -Value "[$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))] $Message" -Encoding UTF8
}

function Get-PlainWebhook {
  param([string]$EncryptedValue)

  try {
    $secureValue = ConvertTo-SecureString -String $EncryptedValue
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
    try {
      return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    } finally {
      [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
    }
  } catch {
    throw 'Could not decrypt the saved webhook for this Windows user.'
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
    throw "Discord request failed (HTTP $status)."
  }
}

function Assert-WebhookChannel {
  param(
    [string]$WebhookUrl,
    [string]$ExpectedChannelId
  )

  if ($WebhookUrl -notmatch '^https://discord\.com/api/webhooks/\d+/[\w-]+/?$') {
    throw 'The saved webhook URL is invalid.'
  }

  $webhook = Invoke-DiscordRequest -Method Get -Uri $WebhookUrl
  if ([string]$webhook.channel_id -ne $ExpectedChannelId) {
    throw "Webhook channel mismatch: expected $ExpectedChannelId, received $($webhook.channel_id). No message was sent."
  }
}

function Send-DiscordEmbeds {
  param(
    [string]$WebhookUrl,
    [object[]]$Embeds,
    [string]$Content,
    [string[]]$AllowedUserMentions = @()
  )

  $payload = @{
    embeds = $Embeds
    allowed_mentions = @{
      parse = @()
      users = $AllowedUserMentions
    }
  }
  if ($Content) {
    $payload.content = $Content
  }

  $json = $payload | ConvertTo-Json -Depth 8 -Compress
  Invoke-DiscordRequest `
    -Method Post `
    -Uri ($WebhookUrl + '?wait=true') `
    -Body ([System.Text.Encoding]::UTF8.GetBytes($json))
}

function Save-Config {
  param([object]$Value)

  $temporaryPath = "$configPath.tmp"
  $Value | ConvertTo-Json | Set-Content -LiteralPath $temporaryPath -Encoding UTF8
  Move-Item -LiteralPath $temporaryPath -Destination $configPath -Force
}

function Send-Greeting {
  param(
    [object]$Config,
    [string]$Kind
  )

  $today = (Get-Date).ToString('yyyy-MM-dd')
  $stateName = if ($Kind -eq 'GoodMorning') { 'lastMorningDate' } else { 'lastNightDate' }
  if ($Config.$stateName -eq $today) {
    Write-ScheduleLog "$Kind already sent today; skipping duplicate."
    return
  }

  $webhookUrl = Get-PlainWebhook -EncryptedValue $Config.greetingsWebhook
  Assert-WebhookChannel -WebhookUrl $webhookUrl -ExpectedChannelId $greetingsChannelId

  $sun = [char]::ConvertFromUtf32(0x2600)
  $flower = [char]::ConvertFromUtf32(0x1F337)
  $chick = [char]::ConvertFromUtf32(0x1F423)
  $moon = [char]::ConvertFromUtf32(0x1F319)
  $teddy = [char]::ConvertFromUtf32(0x1F9F8)
  $sparkles = [char]::ConvertFromUtf32(0x2728)

  if ($Kind -eq 'GoodMorning') {
    $messages = @(
      "Hope your morning feels soft, bright, and full of little reasons to smile. Have a lovely day! $flower",
      "A fresh new day is here - sending you a little sunshine and a big smile. You've got this! $sun",
      "Good morning! May today bring cozy moments, happy surprises, and all the good things you deserve. $chick"
    )
    $title = "Good morning, sweetheart $sun"
    $color = 0xFFD166
  } else {
    $messages = @(
      "You made it through today - now it's time to rest, recharge, and have the sweetest dreams. $moon",
      "The day is done, sweetheart. Get cozy, let the worries go, and sleep peacefully. $teddy",
      "Sending a tiny bundle of hugs for a calm night and the loveliest dreams. Good night! $sparkles"
    )
    $title = "Good night, sweetheart $moon"
    $color = 0xC8B6FF
  }

  $dayNumber = [int](Get-Date).ToString('dd')
  $message = $messages[($dayNumber - 1) % $messages.Count]
  $embed = @{
    title = $title
    description = $message
    color = $color
    footer = @{ text = "A little Campfire hello - $today" }
  }

  Send-DiscordEmbeds `
    -WebhookUrl $webhookUrl `
    -Embeds @($embed) `
    -Content "<@$svjUserId>" `
    -AllowedUserMentions @($svjUserId)

  $Config | Add-Member -NotePropertyName $stateName -NotePropertyValue $today -Force
  Save-Config -Value $Config
  Write-ScheduleLog "$Kind greeting sent to the configured greetings channel."
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
    throw 'Could not read commit file statistics.'
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

function Send-CommitDigest {
  param([object]$Config)

  $repository = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
  $webhookUrl = Get-PlainWebhook -EncryptedValue $Config.commitsWebhook
  Assert-WebhookChannel -WebhookUrl $webhookUrl -ExpectedChannelId $commitsChannelId

  $head = & git -C $repository rev-parse --verify HEAD 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $head) {
    throw 'Could not read the repository HEAD commit.'
  }
  $head = ([string]$head).Trim()
  $lastSha = [string]$Config.lastCommitSha
  if (-not $lastSha) {
    throw 'The commit digest baseline is missing; reinstall the schedule to initialize it safely.'
  }

  & git -C $repository merge-base --is-ancestor $lastSha $head 2>$null
  if ($LASTEXITCODE -ne 0) {
    throw 'The commit digest baseline is not an ancestor of HEAD. Reconcile the Git history and reinstall the schedule.'
  }

  $commitShas = @(& git -C $repository rev-list --reverse "$lastSha..$head" 2>$null)
  if ($LASTEXITCODE -ne 0) {
    throw 'Could not list commits since the previous digest.'
  }

  $largeCommits = @()
  foreach ($sha in $commitShas) {
    $commit = Get-CommitSummary -Repository $repository -Sha ([string]$sha)
    if ($commit.Files -ge 3 -or $commit.ChangedLines -ge 100) {
      $largeCommits += $commit
    }
  }

  if ($largeCommits.Count -gt 0) {
    for ($offset = 0; $offset -lt $largeCommits.Count; $offset += 10) {
      $lastIndex = [Math]::Min($offset + 9, $largeCommits.Count - 1)
      $embeds = @()
      for ($index = $offset; $index -le $lastIndex; $index++) {
        $commit = $largeCommits[$index]
        $subject = $commit.Subject
        if ($subject.Length -gt 700) {
          $subject = $subject.Substring(0, 697) + '...'
        }
        $embeds += @{
          title = ('{0:D2} | {1}' -f ($index + 1), $commit.Sha.Substring(0, 7))
          description = "**$($commit.Date)** | $subject`n`n**$($commit.Files) files** | $($commit.ChangedLines) lines changed"
          color = 0xE87532
        }
      }

      $content = if ($offset -eq 0) {
        "**Campfire | Big commits | $((Get-Date).ToString('yyyy-MM-dd'))**"
      } else {
        '**Campfire | Big commits | continued**'
      }
      Send-DiscordEmbeds -WebhookUrl $webhookUrl -Embeds $embeds -Content $content
      $Config.lastCommitSha = $largeCommits[$lastIndex].Sha
      Save-Config -Value $Config
    }
    Write-ScheduleLog "Posted $($largeCommits.Count) feature-sized commit(s) to #commits."
  } else {
    Write-ScheduleLog 'No feature-sized commits since the previous digest.'
  }

  $Config.lastCommitSha = $head
  Save-Config -Value $Config
}

try {
  if (-not (Test-Path -LiteralPath $configPath -PathType Leaf)) {
    throw 'Schedule configuration was not found. Run the installer again.'
  }

  $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
  if ($Mode -eq 'CommitDigest') {
    Send-CommitDigest -Config $config
  } else {
    Send-Greeting -Config $config -Kind $Mode
  }
} catch {
  $safeMessage = $_.Exception.Message
  if ($safeMessage -match 'https://discord\.com/api/webhooks/') {
    $safeMessage = 'A request failed; webhook details have been withheld.'
  }
  Write-ScheduleLog "ERROR ($Mode): $safeMessage"
  exit 1
}
