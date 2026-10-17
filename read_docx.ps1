Add-Type -AssemblyName System.IO.Compression.FileSystem

$path = 'C:\Users\admin\.gemini\antigravity\brain\4028832e-6052-44e3-ba77-6b9cec947829\.user_uploaded\media_1792263299892_d82d0d74.docx'
$zip = [System.IO.Compression.ZipFile]::OpenRead($path)
$entry = $zip.GetEntry('word/document.xml')
$stream = $entry.Open()
$reader = New-Object System.IO.StreamReader($stream)
$xmlContent = $reader.ReadToEnd()
$reader.Close()
$stream.Close()
$zip.Dispose()

$xml = [xml]$xmlContent
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main')

$nodes = $xml.SelectNodes('//w:p', $ns)
$count = 0
foreach ($p in $nodes) {
    $pText = ""
    $tNodes = $p.SelectNodes('.//w:t', $ns)
    foreach ($t in $tNodes) {
        $pText += $t.InnerText
    }
    if ($pText.Trim().Length -gt 0) {
        Write-Host $pText
        $count++
        if ($count -ge 60) { break }
    }
}
