<#
  Deploy PetroSim frontend to S3 + invalidate CloudFront cache
  Usage: .\deploy-frontend.ps1 [-BucketName petrosim-frontend] [-DistributionId EXXXXXX]
#>
param(
    [string]$BucketName = "petrosim-frontend",
    [string]$DistributionId = "",
    [string]$Region = "eu-west-3"
)

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path))

Write-Host "=== Building frontend ===" -ForegroundColor Cyan
Push-Location "$ROOT\apps\web"
pnpm build
Pop-Location

Write-Host "=== Uploading to S3 ===" -ForegroundColor Cyan
aws s3 sync "$ROOT\apps\web\dist" "s3://$BucketName/" `
  --delete `
  --cache-control "public, max-age=31536000, immutable" `
  --exclude "index.html" `
  --exclude "*.json" `
  --region $Region

aws s3 cp "$ROOT\apps\web\dist\index.html" "s3://$BucketName/index.html" `
  --cache-control "public, max-age=60" `
  --content-type "text/html" `
  --region $Region

Write-Host "=== Frontend deployed to s3://$BucketName ===" -ForegroundColor Green

if ($DistributionId) {
    Write-Host "=== Invalidating CloudFront cache ===" -ForegroundColor Cyan
    aws cloudfront create-invalidation --distribution-id $DistributionId --paths "/*" --region $Region
    Write-Host "=== CloudFront invalidation requested ===" -ForegroundColor Green
}

Write-Host "Done." -ForegroundColor Green
