param(
    [string]$CredentialFile = (Join-Path $PSScriptRoot '../awsTemp'),
    [switch]$Plan
)
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$cli = Get-ChildItem -LiteralPath (Join-Path $root '.tools') -Filter aws.exe -Recurse | Select-Object -First 1
if (-not $cli) { throw 'AWS CLI local ausente.' }
$protectedFile = Join-Path $root '.local/aws-credentials.dpapi'
if (-not $PSBoundParameters.ContainsKey('CredentialFile') -and (Test-Path -LiteralPath $protectedFile)) {
    $encrypted = (Get-Content -Raw -LiteralPath $protectedFile).Trim()
    $secure = ConvertTo-SecureString -String $encrypted
    $credential = [pscredential]::new('local', $secure).GetNetworkCredential().Password | ConvertFrom-Json
    $lines = @($credential.AccessKeyId, $credential.SecretAccessKey)
    $credential = $null
    $secure.Dispose()
} else {
    $lines = @([IO.File]::ReadAllLines((Resolve-Path -LiteralPath $CredentialFile).Path) | ForEach-Object { $_.Trim() } | Where-Object { $_ })
}
if ($lines.Count -ne 2 -or $lines[0] -notmatch '^AKIA[A-Z0-9]{16}$' -or $lines[1] -notmatch '^[A-Za-z0-9/+=]{40}$') {
    throw 'Formato nao reconhecido: esperado par de credenciais IAM em duas linhas. Nenhum segredo foi exibido.'
}
$names = @('AWS_ACCESS_KEY_ID','AWS_SECRET_ACCESS_KEY','AWS_SESSION_TOKEN','AWS_DEFAULT_REGION','AWS_PAGER','AWS_EC2_METADATA_DISABLED')
$previous = @{}
foreach ($name in $names) { $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process') }
function Invoke-ReadOnlyAws([string[]]$Arguments) {
    $ErrorActionPreference = 'Continue'
    $output = & $cli.FullName @Arguments --output json --no-cli-pager 2>&1
    $ErrorActionPreference = 'Stop'
    if ($LASTEXITCODE -ne 0) {
        $message = ($output | Out-String).Replace($lines[0], '[REDACTED]').Replace($lines[1], '[REDACTED]')
        throw $message
    }
    return ($output | Out-String | ConvertFrom-Json)
}
try {
    $env:AWS_ACCESS_KEY_ID = $lines[0]
    $env:AWS_SECRET_ACCESS_KEY = $lines[1]
    $env:AWS_SESSION_TOKEN = $null
    $env:AWS_DEFAULT_REGION = 'us-east-1'
    $env:AWS_PAGER = ''
    $env:AWS_EC2_METADATA_DISABLED = 'true'
    $identity = Invoke-ReadOnlyAws @('sts','get-caller-identity')
    $identity | Select-Object Account,Arn | ConvertTo-Json
    if ($identity.Arn -match ':root$') { throw 'Credencial root identificada; usar identidade IAM dedicada antes de continuar.' }
    if ($identity.Account -ne '320169806724') { throw 'Conta diferente da conta validada para Dililu.' }
    if ($Plan) {
        $terraform = Join-Path $root '.tools/terraform/terraform.exe'
        foreach ($stack in @('bootstrap','site')) {
            & $terraform "-chdir=$root/infra/$stack" plan -input=false -no-color "-out=$root/.local/$stack.tfplan"
            if ($LASTEXITCODE -ne 0) { throw "Falha no plano $stack." }
        }
        return
    }
    $zones = Invoke-ReadOnlyAws @('route53','list-hosted-zones-by-name','--dns-name','sofbrasil.com.br','--max-items','5')
    $zone = @($zones.HostedZones | Where-Object { $_.Name -eq 'sofbrasil.com.br.' -and -not $_.Config.PrivateZone })
    $zone | Select-Object Id,Name | ConvertTo-Json
    foreach ($item in $zone) {
        $records = Invoke-ReadOnlyAws @('route53','list-resource-record-sets','--hosted-zone-id',$item.Id)
        $records.ResourceRecordSets | Where-Object { $_.Name -eq 'dililu.sofbrasil.com.br.' -or ($_.Type -eq 'NS' -and $_.Name -eq 'sofbrasil.com.br.') } | ConvertTo-Json -Depth 6
    }
    $buckets = Invoke-ReadOnlyAws @('s3api','list-buckets')
    @($buckets.Buckets | Where-Object { $_.Name -match 'dililu|terraform|tfstate' } | Select-Object Name) | ConvertTo-Json
    $distributions = Invoke-ReadOnlyAws @('cloudfront','list-distributions')
    @($distributions.DistributionList.Items | Where-Object { $_.Aliases.Items -contains 'dililu.sofbrasil.com.br' } | Select-Object Id,DomainName,Status,Aliases) | ConvertTo-Json -Depth 6
    $certs = Invoke-ReadOnlyAws @('acm','list-certificates','--region','us-east-1')
    @($certs.CertificateSummaryList | Where-Object { $_.DomainName -match 'sofbrasil\.com\.br$' } | Select-Object CertificateArn,DomainName,Status) | ConvertTo-Json
    foreach ($cert in @($certs.CertificateSummaryList | Where-Object { $_.DomainName -match 'sofbrasil\.com\.br$' })) {
        $detail = Invoke-ReadOnlyAws @('acm','describe-certificate','--certificate-arn',$cert.CertificateArn,'--region','us-east-1')
        $detail.Certificate | Select-Object CertificateArn,SubjectAlternativeNames,Status,NotAfter | ConvertTo-Json -Depth 4
    }
} finally {
    foreach ($name in $names) { [Environment]::SetEnvironmentVariable($name, $previous[$name], 'Process') }
    $lines = $null
}
