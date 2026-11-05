$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$runtimeScript = Join-Path $PSScriptRoot 'discord-scheduled-message.ps1'
$configDirectory = Join-Path $env:LOCALAPPDATA 'Campfire\DiscordSchedule'
$configPath = Join-Path $configDirectory 'config.json'
$expectedTimeZone = 'India Standard Time'
$timeZone = [System.TimeZoneInfo]::Local

if ($timeZone.Id -ne $expectedTimeZone) {
  throw "Windows is using '$($timeZone.Id)'. Set the Windows time zone to '$expectedTimeZone' to schedule these posts at the requested IST times."
}

function Convert-SecureStringToPlainText {
  param([System.Security.SecureString]$Value)

  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Value)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

function Read-WebhookForChannel {
  param(
    [string]$Prompt,
    [string]$ExpectedChannelId,
    [string]$ChannelLabel
  )

  $secureUrl = Read-Host -AsSecureString -Prompt $Prompt
  if ($secureUrl.Length -eq 0) {
    throw "A webhook URL is required for $ChannelLabel."
  }

  $url = Convert-SecureStringToPlainText -Value $secureUrl
  if ($url -notmatch '^https://discord\.com/api/webhooks/\d+/[\w-]+/?$') {
    throw "The URL entered for $ChannelLabel is not a standard Discord webhook URL."
  }

  try {
    $webhook = Invoke-RestMethod -UseBasicParsing -Method Get -Uri $url -TimeoutSec 20
  } catch {
    throw "Could not verify the $ChannelLabel webhook. Check the URL and try again."
  }

  if ([string]$webhook.channel_id -ne $ExpectedChannelId) {
    throw "The $ChannelLabel webhook is attached to channel $($webhook.channel_id), not the required channel $ExpectedChannelId."
  }

  return (ConvertFrom-SecureString -SecureString $secureUrl)
}

Write-Output 'Enter a newly rotated webhook for #commits. The URL is hidden while you type.'
$commitsWebhook = Read-WebhookForChannel `
  -Prompt 'Rotated #commits webhook URL' `
  -ExpectedChannelId '1567358109020586057' `
  -ChannelLabel '#commits'

Write-Output 'Enter a separate webhook created in the iyra channel. The URL is hidden while you type.'
$greetingsWebhook = Read-WebhookForChannel `
  -Prompt 'iyra greetings webhook URL' `
  -ExpectedChannelId '1567719634830893126' `
  -ChannelLabel 'iyra'

$head = (& git -C $repoRoot rev-parse --verify HEAD 2>$null)
if ($LASTEXITCODE -ne 0 -or -not $head) {
  throw 'Could not read the repository HEAD commit; ensure this folder is a Git repository.'
}

New-Item -ItemType Directory -Path $configDirectory -Force | Out-Null
$config = [ordered]@{
  commitsWebhook = $commitsWebhook
  greetingsWebhook = $greetingsWebhook
  lastCommitSha = ([string]$head).Trim()
}
$config | ConvertTo-Json | Set-Content -LiteralPath $configPath -Encoding UTF8

$powerShell = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'
$principal = New-ScheduledTaskPrincipal `
  -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) `
  -LogonType Interactive `
  -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 2) `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries
$schedule = @(
  @{ Name = 'CampfireDiscordGoodMorning'; Mode = 'GoodMorning'; Time = [datetime]::Today.AddHours(8).AddMinutes(3) },
  @{ Name = 'CampfireDiscordCommitDigest'; Mode = 'CommitDigest'; Time = [datetime]::Today.AddHours(21).AddMinutes(30) },
  @{ Name = 'CampfireDiscordGoodNight'; Mode = 'GoodNight'; Time = [datetime]::Today.AddHours(22) }
)

foreach ($job in $schedule) {
  $action = New-ScheduledTaskAction `
    -Execute $powerShell `
    -Argument "-NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$runtimeScript`" -Mode $($job.Mode)" `
    -WorkingDirectory $repoRoot
  $trigger = New-ScheduledTaskTrigger -Daily -At $job.Time
  Register-ScheduledTask `
    -TaskName $job.Name `
    -Action $action `
    -Trigger $trigger `
    -Principal $principal `
    -Settings $settings `
    -Description "Campfire Discord $($job.Mode) scheduled in India Standard Time." `
    -Force | Out-Null
}

Write-Output 'Installed three daily tasks (India Standard Time):'
Write-Output '  8:03 AM  - sweetheart good-morning greeting in iyra'
Write-Output '  9:30 PM  - feature-sized commit digest in #commits'
Write-Output ' 10:00 PM  - sweetheart good-night greeting in iyra'
Write-Output 'Tasks run while this Windows user is signed in and the PC is on.'
