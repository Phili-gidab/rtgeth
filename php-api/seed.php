<?php
/*
 * CLI migrate + seed for the PHP API (port of server/src/db/{migrate,seed}.js).
 * Run on the server:  php ~/rtg-api/seed.php [/path/to/rtg-api-config.php]
 * Idempotent: schema uses IF NOT EXISTS, admin/content are never overwritten,
 * collections are skipped when they already contain rows.
 */

declare(strict_types=1);

$configPath = $argv[1] ?? (getenv('HOME') . '/rtg-api-config.php');
if (!is_file($configPath)) { fwrite(STDERR, "Config not found: $configPath\n"); exit(1); }
$cfg = require $configPath;

$pdo = new PDO(
  sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $cfg['DB_HOST'], (int)($cfg['DB_PORT'] ?? 3306), $cfg['DB_NAME']),
  $cfg['DB_USER'], $cfg['DB_PASSWORD'],
  [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
);

/* ---- schema ---- */
$schema = file_get_contents(__DIR__ . '/schema.sql');
$schema = preg_replace('/^\s*--.*$/m', '', $schema); // strip comment lines, keep the statements under them
foreach (array_filter(array_map('trim', explode(';', $schema))) as $stmt) {
  if ($stmt !== '') $pdo->exec($stmt);
}
echo "Schema applied to {$cfg['DB_NAME']}\n";

/* ---- admin user ---- */
if (!empty($cfg['ADMIN_EMAIL']) && !empty($cfg['ADMIN_PASSWORD'])) {
  $hash = password_hash($cfg['ADMIN_PASSWORD'], PASSWORD_BCRYPT, ['cost' => 11]);
  $pdo->prepare('INSERT INTO users (email, password_hash, role) VALUES (?,?,?) ON DUPLICATE KEY UPDATE email = email')
    ->execute([$cfg['ADMIN_EMAIL'], $hash, 'super_admin']);
  echo "Admin ensured: {$cfg['ADMIN_EMAIL']}\n";
}

/* ---- default content (never overwrites live edits) ---- */
$seed = json_decode(file_get_contents(__DIR__ . '/seed-data.json'), true);

foreach ($seed['singles'] as $k => $data) {
  $pdo->prepare('INSERT INTO content (k, data) VALUES (?,?) ON DUPLICATE KEY UPDATE k = k')
    ->execute([$k, json_encode($data, JSON_UNESCAPED_UNICODE)]);
}
echo 'Singles ensured: ' . implode(', ', array_keys($seed['singles'])) . "\n";

foreach ($seed['collections'] as $collection => $rows) {
  $st = $pdo->prepare('SELECT COUNT(*) AS n FROM items WHERE collection = ?');
  $st->execute([$collection]);
  $n = (int)$st->fetch()['n'];
  if ($n > 0) { echo "skip $collection (has $n)\n"; continue; }
  $ins = $pdo->prepare('INSERT INTO items (collection, data, sort) VALUES (?,?,?)');
  foreach (array_values($rows) as $i => $row) $ins->execute([$collection, json_encode($row, JSON_UNESCAPED_UNICODE), $i + 1]);
  echo "seeded $collection: " . count($rows) . "\n";
}
echo "Seed complete.\n";
