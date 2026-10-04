<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$dir = __DIR__;
$files = @scandir($dir);
$tracks = [];

$validExtensions = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'];

if (is_array($files)) {
    foreach ($files as $file) {
        if ($file === '.' || $file === '..' || $file === 'list.php' || $file === 'manifest.json' || $file === 'README.txt' || is_dir($dir . '/' . $file)) {
            continue;
        }
        $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
        if (in_array($ext, $validExtensions)) {
            $cleanName = pathinfo($file, PATHINFO_FILENAME);
            // Replace underscores, dashes with clean spaces
            $displayName = ucwords(trim(preg_replace('/[_\-]+/', ' ', $cleanName)));
            $tracks[] = [
                'id' => 'folder_' . substr(md5($file), 0, 8),
                'name' => '🎵 ' . $displayName,
                'fullName' => $file,
                'url' => 'music/' . rawurlencode($file),
                'isLocalFolder' => true
            ];
        }
    }
}

echo json_encode(['success' => true, 'count' => count($tracks), 'tracks' => $tracks]);
