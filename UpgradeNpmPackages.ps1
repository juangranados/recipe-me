<#
.SYNOPSIS
	Install latest versions of npm packages.
.DESCRIPTION
	This script install latest versions based on npm outdated.
.PARAMETER path (optional)
	Path where run command.
    Example: .\UpgradeNpmPackages.ps1 -path 'D:\Angular\project-x'
.PARAMETER g (optional)
    Update global packages.
    Example: .\UpgradeNpmPackages.ps1 -g
.NOTES 
	Author: Juan Granados 
	Date:   October 2018
#>
Param(
		[Parameter(Mandatory=$false,Position=0)] 
		[ValidateNotNullOrEmpty()]
		[string]$path,
        [Parameter(Mandatory=$false,Position=1)] 
		[ValidateNotNullOrEmpty()]
		[switch]$g
	)
if ($path) {
    Set-Location -Path $path
}
if ($g) {
    $packages = npm -g outdated
} else {
     $packages = npm outdated
}
if (-not $packages) {
    Write-Host "There is no packages to update"
    Exit 0
}
foreach ($package in $packages) {
    $p = -split $package
    if ($p[0] -ne "Package") {
        if ($p[1] -ne $p[3]) {
        Write-Host "Installing $($p[0])@$($p[3])"
        if ($g){
            $process = Start-Process "npm" "-g i $($p[0])@$($p[3])" -PassThru -Wait -NoNewWindow
        } else {
            $process = Start-Process "npm" "i $($p[0])@$($p[3])" -PassThru -Wait -NoNewWindow
            }
        if ($process.ExitCode) {
                Write-Host "Installation failed" -ForegroundColor Red
        } else {
            Write-Host "Installation successful" -ForegroundColor Green
        }
        }
    }
}
if (-not $g) {
    Write-Host "Fixing vulnerabilities"
    npm audit fix
}