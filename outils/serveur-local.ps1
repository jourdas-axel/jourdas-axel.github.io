# Serveur web local pour tester le portfolio
# Lancement : double-clic sur "Lancer le portfolio.bat" (à la racine du projet)
# Arrêt : fermer la fenêtre, ou Ctrl+C
param([int]$Port = 8080)

$Root = Split-Path -Parent $PSScriptRoot   # dossier du portfolio
$mime = @{
  '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8'
  '.json'='application/json'; '.png'='image/png'; '.jpg'='image/jpeg'; '.jpeg'='image/jpeg'; '.webp'='image/webp'
  '.svg'='image/svg+xml'; '.pdf'='application/pdf'; '.ico'='image/x-icon'
}

# Cherche un port libre à partir de 8080
$listener = $null
for ($p = $Port; $p -lt $Port + 20; $p++) {
  try { $l = New-Object Net.HttpListener; $l.Prefixes.Add("http://localhost:$p/"); $l.Start(); $listener = $l; $Port = $p; break } catch { }
}
if (-not $listener) { Write-Host "Aucun port libre trouvé entre 8080 et 8099." -ForegroundColor Red; Read-Host "Entrée pour quitter"; exit 1 }

$url = "http://localhost:$Port/"
Write-Host ""
Write-Host "  Portfolio en ligne sur $url" -ForegroundColor Green
Write-Host "  Dossier servi : $Root"
Write-Host "  Fermez cette fenêtre pour arrêter le serveur."
Write-Host ""
Start-Process $url

$rootFull = [IO.Path]::GetFullPath($Root)
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  try {
    $rel = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart('/'))
    if ($rel -eq '' -or $rel.EndsWith('/')) { $rel += 'index.html' }
    $full = [IO.Path]::GetFullPath((Join-Path $Root $rel))
    if ($full.StartsWith($rootFull) -and (Test-Path -LiteralPath $full -PathType Leaf)) {
      $bytes = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $ctx.Response.ContentType = if ($mime[$ext]) { $mime[$ext] } else { 'application/octet-stream' }
      $ctx.Response.Headers.Add('Cache-Control', 'no-store')
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      Write-Host "200  /$rel"
    } else {
      $ctx.Response.StatusCode = 404
      $b = [Text.Encoding]::UTF8.GetBytes('404 - page introuvable'); $ctx.Response.OutputStream.Write($b, 0, $b.Length)
      Write-Host "404  /$rel" -ForegroundColor Yellow
    }
  } catch { Write-Host "Erreur : $_" -ForegroundColor Red }
  finally { $ctx.Response.Close() }
}
