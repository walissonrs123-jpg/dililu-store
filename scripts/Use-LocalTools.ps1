# Dot-source: . ./scripts/Use-LocalTools.ps1
$projectRoot = Split-Path $PSScriptRoot -Parent
$nodeDirectory = Get-ChildItem -LiteralPath (Join-Path $projectRoot '.tools/node') -Directory | Select-Object -First 1
if (-not $nodeDirectory) { throw 'Node local ausente.' }
$env:PATH = $nodeDirectory.FullName + ';' + (Join-Path $projectRoot '.tools/git/cmd') + ';' + $env:PATH
$env:NEXT_TELEMETRY_DISABLED = '1'
$env:npm_config_cache = Join-Path $projectRoot '.tools/npm-cache'
