<?php
/*
 * One-off: add alt text to already-seeded gallery rows that lack it
 * (rows are matched to seed-data.json by sort order; edited rows keep
 * whatever alt an editor may have set). Safe to re-run.
 */
$configPath = $argv[1] ?? (getenv('HOME') . '/rtg-api-config.php');
$cfg = require $configPath;
$pdo = new PDO(
  sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $cfg['DB_HOST'], (int)($cfg['DB_PORT'] ?? 3306), $cfg['DB_NAME']),
  $cfg['DB_USER'], $cfg['DB_PASSWORD'],
  [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);

$seed = json_decode(file_get_contents(__DIR__ . '/seed-data.json'), true);
$altsBySort = [];
foreach (array_values($seed['collections']['gallery']) as $i => $row) {
  if (!empty($row['alt'])) $altsBySort[$i + 1] = $row['alt'];
}

$st = $pdo->query("SELECT id, sort, data FROM items WHERE collection = 'gallery'");
$upd = $pdo->prepare('UPDATE items SET data = ? WHERE id = ?');
$n = 0;
foreach ($st as $row) {
  $data = json_decode($row['data'], true);
  if (!empty($data['alt']) || empty($altsBySort[$row['sort']])) continue;
  $data['alt'] = $altsBySort[$row['sort']];
  $upd->execute([json_encode($data, JSON_UNESCAPED_UNICODE), $row['id']]);
  $n++;
}
echo "alt added to $n gallery rows\n";
