[CmdletBinding()]
param(
    [string]$EnvFile,
    [int]$HostPort = 4200
)

$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$image = 'maestria-computacion-front:local'
$container = 'maestria-computacion-front-local'

if (-not $EnvFile) {
    $EnvFile = Join-Path $PSScriptRoot 'front.env'
}

if (-not (Test-Path -LiteralPath $EnvFile)) {
    throw "No se encontró $EnvFile. Créelo a partir de deploy/front.env.example."
}

docker info | Out-Null
if ($LASTEXITCODE -ne 0) {
    throw 'Docker no está disponible. Inicie Docker Desktop.'
}

Write-Host "Construyendo $image..."
docker buildx build `
    --platform linux/amd64 `
    --tag $image `
    --load `
    $repositoryRoot
if ($LASTEXITCODE -ne 0) {
    throw 'La construcción de la imagen falló.'
}

$existingContainer = docker container inspect $container 2>$null
if ($LASTEXITCODE -eq 0 -and $existingContainer) {
    Write-Host "Reemplazando el contenedor $container..."
    docker container rm --force $container | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw 'No fue posible reemplazar el contenedor anterior.'
    }
}

docker run -d `
    --name $container `
    --env-file $EnvFile `
    --publish "${HostPort}:80" `
    $image
if ($LASTEXITCODE -ne 0) {
    throw 'No fue posible iniciar el contenedor.'
}

Write-Host "Frontend iniciado en http://localhost:$HostPort"
Write-Host "Consulte su estado con: docker ps --filter name=$container"
