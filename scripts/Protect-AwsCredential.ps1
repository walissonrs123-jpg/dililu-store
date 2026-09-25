# Windows DPAPI: encrypted for the current Windows user on this machine.
# No AWS calls and no credentials in output. Original source is preserved.
param([string]$CredentialFile = (Join-Path $PSScriptRoot '../awsTemp'))
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$lines = @([IO.File]::ReadAllLines((Resolve-Path -LiteralPath $CredentialFile).Path) | ForEach-Object { $_.Trim() } | Where-Object { $_ })
if ($lines.Count -ne 2 -or $lines[0] -notmatch '^AKIA[A-Z0-9]{16}$' -or $lines[1] -notmatch '^[A-Za-z0-9/+=]{40}$') { throw 'Formato de credencial inesperado; nenhum dado exibido.' }
$payload = @{ AccessKeyId = $lines[0]; SecretAccessKey = $lines[1] } | ConvertTo-Json -Compress
$secure = ConvertTo-SecureString -String $payload -AsPlainText -Force
$encrypted = ConvertFrom-SecureString -SecureString $secure
$restored = [pscredential]::new('local', (ConvertTo-SecureString -String $encrypted)).GetNetworkCredential().Password
if ($restored -cne $payload) { throw 'Verificacao DPAPI falhou.' }
New-Item -ItemType Directory -Path (Join-Path $root '.local') -Force | Out-Null
$destination = Join-Path $root '.local/aws-credentials.dpapi'
Set-Content -LiteralPath $destination -Value $encrypted -Encoding UTF8
$readBack = Get-Content -Raw -LiteralPath $destination
if ([pscredential]::new('local', (ConvertTo-SecureString -String $readBack.Trim())).GetNetworkCredential().Password -cne $payload) { throw 'Verificacao do arquivo protegido falhou.' }
$lines = $payload = $restored = $null
$secure.Dispose()
Write-Output 'DPAPI local: PASS. Arquivo original preservado. Nenhuma chamada AWS executada.'
