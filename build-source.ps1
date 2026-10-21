param(
	[string] $ThemePath = 'C:\laragon\www\ats\wp-content\themes\ats'
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $ThemePath -PathType Container)) {
	throw "Theme source directory not found: $ThemePath"
}

$ThemePath = (Resolve-Path -LiteralPath $ThemePath).Path.TrimEnd('\')
$OutputDirectory = Join-Path $PSScriptRoot 'assets'
$OutputPath = Join-Path $OutputDirectory 'ats-theme-source.zip'

if (-not (Test-Path -LiteralPath (Join-Path $ThemePath 'style.css') -PathType Leaf)) {
	throw "Theme source does not contain style.css: $ThemePath"
}

New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

if (Test-Path -LiteralPath $OutputPath -PathType Leaf) {
	Remove-Item -LiteralPath $OutputPath
}

$Stream = [System.IO.File]::Open($OutputPath, [System.IO.FileMode]::CreateNew)
try {
	$Archive = New-Object System.IO.Compression.ZipArchive(
		$Stream,
		[System.IO.Compression.ZipArchiveMode]::Create,
		$false
	)
	try {
		foreach ($File in [System.IO.Directory]::EnumerateFiles(
			$ThemePath,
			'*',
			[System.IO.SearchOption]::AllDirectories
		)) {
			$RelativePath = $File.Substring($ThemePath.Length + 1)
			$Segments = $RelativePath -split '[\\/]'
			$IsBackup = $false

			foreach ($Segment in $Segments) {
				if ($Segment -eq '.git' -or $Segment -match '(?i)^backup(?:\s|$)') {
					$IsBackup = $true
					break
				}
			}

			if ($IsBackup) {
				continue
			}

			$EntryName = $RelativePath -replace '\\', '/'
			[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
				$Archive,
				$File,
				$EntryName,
				[System.IO.Compression.CompressionLevel]::Optimal
			) | Out-Null
		}
	} finally {
		$Archive.Dispose()
	}
} finally {
	$Stream.Dispose()
}

Write-Output "Created $OutputPath"
