param(
  [Parameter(Mandatory = $true)]
  [string]$BaseUrl,

  [string]$TrackOrderNumber = "",
  [int]$TimeoutSec = 25
)

$ErrorActionPreference = 'Stop'

function Invoke-Check {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Url
  )

  Write-Host "Checking: $Name"
  try {
    $response = Invoke-RestMethod -Method Get -Uri $Url -TimeoutSec $TimeoutSec
    Write-Host "PASS: $Name"
    return $response
  }
  catch {
    Write-Host "FAIL: $Name"
    Write-Host $_.Exception.Message
    throw
  }
}

if ($BaseUrl.EndsWith('/')) {
  $BaseUrl = $BaseUrl.TrimEnd('/')
}

Write-Host "Running smoke tests against: $BaseUrl"

$health = Invoke-Check -Name "Health endpoint" -Url "$BaseUrl/api/health"
if (-not $health.status) {
  throw "Health endpoint response did not include status field"
}

Invoke-Check -Name "Products list" -Url "$BaseUrl/api/products"
Invoke-Check -Name "Categories list" -Url "$BaseUrl/api/categories"
Invoke-Check -Name "Stripe config" -Url "$BaseUrl/api/payment/config"

if ($TrackOrderNumber -ne "") {
  Invoke-Check -Name "Track order" -Url "$BaseUrl/api/orders/track/$TrackOrderNumber"
}

Write-Host "All smoke checks completed successfully."
