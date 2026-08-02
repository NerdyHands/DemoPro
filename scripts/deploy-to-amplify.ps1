# Deploy a static build to AWS Amplify (manual-deploy apps) via AWS CLI.
# Usage: .\scripts\deploy-to-amplify.ps1 -Site client [-SkipBuild] [-ConfigPath ./amplify-deploy.config.json]

param(
    [Parameter(Mandatory = $true)]
    [string]$Site,

    [switch]$SkipBuild,

    [string]$ConfigPath = ""
)

$ErrorActionPreference = "Stop"

# AWS CLI on some Windows setups fails certificate verification; enable skip for local deploys.
if (-not $env:AWS_SKIP_SSL_VERIFY) {
    $env:AWS_SKIP_SSL_VERIFY = "1"
}

function Write-Step {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Failure {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

function Get-AwsCliArgs {
    param(
        [string]$Region,
        [string]$Profile
    )

    $args = @("--region", $Region, "--output", "json")
    if ($Profile) {
        $args += @("--profile", $Profile)
    }
    if ($env:AWS_SKIP_SSL_VERIFY -eq "1") {
        $args += "--no-verify-ssl"
    }
    return $args
}

function Invoke-AwsCli {
    param(
        [string[]]$CommandArgs,
        [string]$Region,
        [string]$Profile
    )

    $baseArgs = Get-AwsCliArgs -Region $Region -Profile $Profile
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $rawOutput = & aws @baseArgs @CommandArgs 2>&1
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $prevEap
    }

    $output = @($rawOutput | ForEach-Object {
        if ($_ -is [System.Management.Automation.ErrorRecord]) { $_.ToString() } else { $_ }
    }) | Where-Object {
        $_ -notmatch 'urllib3\\connectionpool|InsecureRequestWarning|ssl-warnings'
    }

    if ($exitCode -ne 0) {
        throw ($output | Out-String).Trim()
    }

    $jsonText = ($output | Out-String).Trim()
    if (-not $jsonText) {
        return $null
    }
    return $jsonText | ConvertFrom-Json
}

function Test-AwsEnvironment {
    param(
        [string]$Region,
        [string]$Profile
    )

    if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
        throw "AWS CLI is not installed. Install AWS CLI v2: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    }

    if ($env:AWS_CA_BUNDLE -and -not (Test-Path $env:AWS_CA_BUNDLE)) {
        throw "AWS_CA_BUNDLE is set but file not found: $env:AWS_CA_BUNDLE"
    }

    Write-Step "Verifying AWS credentials..."
    try {
        $identity = Invoke-AwsCli -CommandArgs @("sts", "get-caller-identity") -Region $Region -Profile $Profile
        Write-Host "  Account: $($identity.Account)  User/Role: $($identity.Arn)" -ForegroundColor Gray
    }
    catch {
        $details = ($_ | Out-String) -replace '(?m)^urllib3\\connectionpool.*\r?\n', ''
        $hint = @(
            "AWS credentials check failed.",
            "  - Update ~/.aws/credentials or run: aws configure",
            "  - Or set profile in amplify-deploy.config.json",
            "  - SSL error? Set AWS_CA_BUNDLE to your CA cert file, or AWS_SKIP_SSL_VERIFY=1 for local dev only"
        ) -join "`n"
        throw "$hint`n`nDetails: $($details.Trim())"
    }

    Write-Step "Verifying Amplify API access..."
    try {
        Invoke-AwsCli -CommandArgs @("amplify", "list-apps", "--max-results", "1") -Region $Region -Profile $Profile | Out-Null
    }
    catch {
        throw @"
Amplify API access failed. Ensure IAM permissions include:
  amplify:CreateDeployment, amplify:StartDeployment, amplify:GetJob, amplify:GetApp, amplify:ListApps

If using the project's S3 IAM user, add an Amplify deploy policy in AWS IAM Console,
or use credentials for an IAM user/role with Amplify access.

Details: $_
"@
    }
}

function New-BuildZip {
    param(
        [string]$BuildDir,
        [string]$TempZipPath
    )

    $buildPath = Join-Path (Get-Location) $BuildDir
    if (-not (Test-Path (Join-Path $buildPath "index.html"))) {
        throw "Build output not found at '$BuildDir/index.html'. Run the build first or omit -SkipBuild."
    }

    if (Test-Path $TempZipPath) {
        Remove-Item $TempZipPath -Force
    }

    Push-Location $buildPath
    try {
        Compress-Archive -Path "*" -DestinationPath $TempZipPath -Force
    }
    finally {
        Pop-Location
    }

    $sizeMb = [math]::Round((Get-Item $TempZipPath).Length / 1MB, 2)
    Write-Success "Created deployment zip ($sizeMb MB): $TempZipPath"
}

function Wait-AmplifyJob {
    param(
        [string]$AppId,
        [string]$BranchName,
        [string]$JobId,
        [string]$Region,
        [string]$Profile,
        [int]$TimeoutSeconds = 900,
        [int]$PollSeconds = 10
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    Write-Step "Waiting for Amplify deployment (job $JobId)..."

    while ((Get-Date) -lt $deadline) {
        $job = Invoke-AwsCli -CommandArgs @(
            "amplify", "get-job",
            "--app-id", $AppId,
            "--branch-name", $BranchName,
            "--job-id", $JobId
        ) -Region $Region -Profile $Profile

        $status = $job.job.summary.status
        Write-Host "  Status: $status" -ForegroundColor Gray

        if ($status -eq "SUCCEED") {
            return $job.job
        }
        if ($status -in @("FAILED", "CANCELLED")) {
            $reason = $job.job.steps | ForEach-Object { "$($_.stepName): $($_.status)" }
            throw "Amplify deployment $status.`n$($reason -join "`n")"
        }

        Start-Sleep -Seconds $PollSeconds
    }

    throw "Timed out waiting for Amplify job $JobId after $TimeoutSeconds seconds."
}

# --- Main ---

$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot

if (-not $ConfigPath) {
    $ConfigPath = Join-Path $repoRoot "amplify-deploy.config.json"
}

if (-not (Test-Path $ConfigPath)) {
    $example = Join-Path $repoRoot "amplify-deploy.config.example.json"
    throw "Config not found: $ConfigPath`nCopy $example to amplify-deploy.config.json and set your Amplify app ID."
}

$config = Get-Content $ConfigPath -Raw | ConvertFrom-Json
$region = if ($config.region) { $config.region } else { "us-east-1" }
$profile = if ($config.profile) { $config.profile } else { $null }

if (-not $config.sites.$Site) {
    $available = ($config.sites.PSObject.Properties.Name) -join ", "
    throw "Site '$Site' not found in config. Available sites: $available"
}

$siteConfig = $config.sites.$Site
$appId = $siteConfig.appId
$branch = $siteConfig.branch
$buildDir = $siteConfig.buildDir
$buildCommand = $siteConfig.buildCommand

if (-not $appId -or $appId -eq "YOUR_APP_ID") {
    throw "Set a real Amplify appId for site '$Site' in $ConfigPath (App settings -> General in Amplify Console)."
}

$projectName = if ($config.projectName) { $config.projectName } else { Split-Path $repoRoot -Leaf }

Write-Host ""
Write-Host "$projectName -> AWS Amplify Deploy" -ForegroundColor Green
Write-Host ("=" * [Math]::Min(40, $projectName.Length + 24)) -ForegroundColor Green
Write-Host "Site:   $Site"
Write-Host "App:    $appId"
Write-Host "Branch: $branch"
Write-Host "Build:  $buildDir"
Write-Host ""

Test-AwsEnvironment -Region $region -Profile $profile

if (-not $SkipBuild) {
    if (-not $buildCommand) {
        throw "No buildCommand configured for site '$Site'."
    }

    $siteRoot = Split-Path $buildDir -Parent
    if (-not $siteRoot) {
        $siteRoot = "."
    }
    $siteRootPath = Join-Path $repoRoot $siteRoot

    Write-Step "Building site in $siteRoot ($buildCommand)..."
    Push-Location $siteRootPath
    try {
        Invoke-Expression $buildCommand
        if ($LASTEXITCODE -ne 0) {
            throw "Build failed with exit code $LASTEXITCODE."
        }
    }
    finally {
        Pop-Location
    }
    Write-Success "Build completed."
}
else {
    Write-Host "Skipping build (-SkipBuild)." -ForegroundColor Yellow
}

$tempZip = Join-Path $env:TEMP "amplify-deploy-$Site-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
try {
    New-BuildZip -BuildDir $buildDir -TempZipPath $tempZip

    Write-Step "Creating Amplify deployment..."
    $deployment = Invoke-AwsCli -CommandArgs @(
        "amplify", "create-deployment",
        "--app-id", $appId,
        "--branch-name", $branch
    ) -Region $region -Profile $profile

    $jobId = $deployment.jobId
    $zipUploadUrl = $deployment.zipUploadUrl
    if (-not $jobId -or -not $zipUploadUrl) {
        throw "Unexpected create-deployment response: missing jobId or zipUploadUrl."
    }

    Write-Step "Uploading zip to Amplify..."
    $zipBytes = [System.IO.File]::ReadAllBytes($tempZip)
    $uploadResponse = Invoke-WebRequest -Uri $zipUploadUrl -Method Put -Body $zipBytes -ContentType "application/zip" -UseBasicParsing
    if ($uploadResponse.StatusCode -ge 400) {
        throw "Zip upload failed with HTTP $($uploadResponse.StatusCode)."
    }
    Write-Success "Upload complete."

    Write-Step "Starting deployment (job $jobId)..."
    Invoke-AwsCli -CommandArgs @(
        "amplify", "start-deployment",
        "--app-id", $appId,
        "--branch-name", $branch,
        "--job-id", $jobId
    ) -Region $region -Profile $profile | Out-Null

    $completedJob = Wait-AmplifyJob -AppId $appId -BranchName $branch -JobId $jobId -Region $region -Profile $profile

    $app = Invoke-AwsCli -CommandArgs @("amplify", "get-app", "--app-id", $appId) -Region $region -Profile $profile
    $defaultDomain = $app.app.defaultDomain

    Write-Host ""
    Write-Success "Deployment succeeded!"
    if ($defaultDomain) {
        Write-Host "Live URL: https://$branch.$defaultDomain" -ForegroundColor Yellow
    }
    Write-Host "Console:  https://console.aws.amazon.com/amplify/home?region=$region#/$appId/$branch/$jobId" -ForegroundColor Gray
}
finally {
    if (Test-Path $tempZip) {
        Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
    }
}
