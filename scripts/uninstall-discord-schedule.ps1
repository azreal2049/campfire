$ErrorActionPreference = 'Stop'

$taskNames = @(
  'CampfireDiscordGoodMorning',
  'CampfireDiscordCommitDigest',
  'CampfireDiscordGoodNight'
)

foreach ($taskName in $taskNames) {
  $task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
  if ($task) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    Write-Output "Removed $taskName."
  } else {
    Write-Output "$taskName is not installed."
  }
}

$configPath = Join-Path $env:LOCALAPPDATA 'Campfire\DiscordSchedule\config.json'
if (Test-Path -LiteralPath $configPath -PathType Leaf) {
  Remove-Item -LiteralPath $configPath -Force
  Write-Output 'Removed the locally encrypted Discord webhook configuration.'
}
