
Set-Location -Path D:\Angular\recipe-me
$packages = npm outdated
if (-not $packages) {
    Write-Host "There is no packages to update"
}
foreach ($package in $packages) {
    $p = -split $package
    if ($p[0] -ne "Package") {
        if ($p[1] -ne $p[3]) {
        Write-Host "Installing $($p[0])@$($p[3])"
            $process = Start-Process "npm" "i $($p[0])@$($p[3])" -PassThru -Wait -NoNewWindow
            if ($process.ExitCode) {
                Write-Host "Installation failed" -ForegroundColor Red
            } else {
                Write-Host "Installation successful" -ForegroundColor Green
            }
        }
    }
}