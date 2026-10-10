$projectRoot = Split-Path -Parent $PSScriptRoot
$node = (Get-Command node.exe -ErrorAction Stop).Source

function Start-IfPortIsFree {
    param(
        [int]$Port,
        [string]$EntryPoint,
        [string[]]$Arguments
    )

    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        return
    }

    Start-Process -FilePath $node `
        -ArgumentList (@($EntryPoint) + $Arguments) `
        -WorkingDirectory $projectRoot `
        -WindowStyle Hidden
}

Start-IfPortIsFree -Port 5173 `
    -EntryPoint (Join-Path $projectRoot 'node_modules/vite/bin/vite.js') `
    -Arguments @('--host', '0.0.0.0', '--port', '5173', '--strictPort')

Start-IfPortIsFree -Port 3000 `
    -EntryPoint (Join-Path $projectRoot 'node_modules/tsx/dist/cli.mjs') `
    -Arguments @('backend/server.ts')