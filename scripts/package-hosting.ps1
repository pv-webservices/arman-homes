$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $projectRoot
try {
    & npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw 'Website build failed; no new upload ZIP was created.' }

    $distPath = Join-Path $projectRoot 'dist'
    $requiredFiles = @('index.html', '.htaccess', '_astro/.htaccess', '404.html', 'robots.txt', 'sitemap.xml', 'sitemap-index.xml', 'favicon.ico', 'site.webmanifest')
    foreach ($requiredFile in $requiredFiles) {
        if (-not (Test-Path -LiteralPath (Join-Path $distPath $requiredFile) -PathType Leaf)) {
            throw "Missing website file: $requiredFile"
        }
    }
    $homepageHtml = Get-Content -LiteralPath (Join-Path $distPath 'index.html') -Raw
    $robots = Get-Content -LiteralPath (Join-Path $distPath 'robots.txt') -Raw
    $sitemap = Get-Content -LiteralPath (Join-Path $distPath 'sitemap.xml') -Raw
    if ($homepageHtml -notmatch '<link rel="canonical" href="https://armanhomes\.in/"' -or
        $homepageHtml -notmatch 'name="robots" content="index, follow, max-image-preview:large"' -or
        $robots -notmatch '(?m)^Allow: /\r?$' -or
        $robots -notmatch 'Sitemap: https://armanhomes\.in/sitemap-index\.xml' -or
        $sitemap -notmatch '<loc>https://armanhomes\.in/</loc>') {
        throw 'Production domain or indexing settings are incorrect. Check .env.production and environment overrides.'
    }
    $unexpected = Get-ChildItem -LiteralPath $distPath -Recurse -Force -File | Where-Object {
        $_.Name -match '^(\.env(?:\..*)?|wp-config\.php|package(?:-lock)?\.json)$' -or $_.Extension -in @('.ps1', '.ts', '.php')
    }
    if ($unexpected) { throw 'Unexpected source or configuration files found in dist; ZIP creation stopped.' }

    $outputPath = Join-Path $projectRoot 'output\hosting'
    New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
    $zipPath = Join-Path $outputPath 'arman-homes-public-html.zip'
    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    # Include hidden files and use forward slashes for Linux hosting extraction.
    $temporaryZip = Join-Path $outputPath ('arman-homes-' + [guid]::NewGuid().ToString('N') + '.zip')
    $websiteFiles = @(Get-ChildItem -LiteralPath $distPath -Recurse -Force -File)
    $archive = [System.IO.Compression.ZipFile]::Open($temporaryZip, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        foreach ($websiteFile in $websiteFiles) {
            $entryName = $websiteFile.FullName.Substring($distPath.Length + 1).Replace('\', '/')
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $websiteFile.FullName, $entryName) | Out-Null
        }
    } finally { $archive.Dispose() }
    $archive = [System.IO.Compression.ZipFile]::OpenRead($temporaryZip)
    try {
        $entries = @($archive.Entries | ForEach-Object { $_.FullName })
        if (@($entries | Where-Object { $_.Contains('\') }).Count -gt 0) {
            throw 'Upload ZIP contains Windows path separators.'
        }
        foreach ($requiredFile in $requiredFiles) {
            if ($requiredFile -notin $entries) { throw "Upload ZIP is missing root file: $requiredFile" }
        }
        $fileCount = $websiteFiles.Count
        if ($archive.Entries.Count -ne $fileCount) { throw 'Upload ZIP file count does not match the build.' }
    } finally { $archive.Dispose() }
    Move-Item -LiteralPath $temporaryZip -Destination $zipPath -Force
    Write-Output "Upload ZIP ready: $zipPath"
    Write-Output "$fileCount files; extract directly into /domains/armanhomes.in/public_html/"
} finally {
    Pop-Location
}
