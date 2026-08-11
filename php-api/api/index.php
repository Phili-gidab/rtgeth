<?php
/*
 * RTG CMS API — front controller. PHP port of server/src (Express),
 * endpoint-for-endpoint, so the React frontend and admin panel need no changes.
 * Routed here by public_html/.htaccess: RewriteRule ^api(/.*)?$ api/index.php
 */

declare(strict_types=1);
require __DIR__ . '/lib.php';

error_reporting(E_ALL);
ini_set('display_errors', '0');

set_exception_handler(function (Throwable $e) {
  error_log('RTG API: ' . $e->getMessage() . ' @ ' . $e->getFile() . ':' . $e->getLine());
  send(500, ['error' => 'Internal server error']);
});

apply_cors();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = preg_replace('#^/api#', '', $path) ?: '/';
$path = rtrim($path, '/') ?: '/';

/* ---------- public ---------- */

if ($method === 'GET' && $path === '/health') {
  send(200, ['ok' => true, 'ts' => (int)(microtime(true) * 1000)]);
}

if ($method === 'POST' && $path === '/auth/login') {
  rate_limit('login', 300, 10);
  $b = body_json();
  $email = $b['email'] ?? ''; $password = $b['password'] ?? '';
  if (!$email || !$password) fail(400, 'Email and password required');
  $st = db()->prepare('SELECT * FROM users WHERE email = ? AND is_disabled = 0');
  $st->execute([$email]);
  $user = $st->fetch();
  if (!$user || !password_verify($password, str_replace('$2a$', '$2y$', $user['password_hash']))) {
    fail(401, 'Invalid credentials');
  }
  send(200, ['token' => jwt_sign($user), 'user' => ['email' => $user['email'], 'role' => $user['role']]]);
}

if ($method === 'GET' && $path === '/auth/me') {
  $u = require_admin();
  send(200, ['email' => $u['email'], 'role' => $u['role']]);
}

if ($method === 'POST' && $path === '/auth/password') {
  $u = require_admin();
  rate_limit('pwchange', 300, 5);
  $b = body_json();
  $current = (string)($b['current'] ?? '');
  $new = (string)($b['new'] ?? '');
  if (strlen($new) < 10) fail(400, 'New password must be at least 10 characters');
  $st = db()->prepare('SELECT * FROM users WHERE id = ? AND is_disabled = 0');
  $st->execute([(int)$u['sub']]);
  $user = $st->fetch();
  if (!$user || !password_verify($current, str_replace('$2a$', '$2y$', $user['password_hash']))) {
    fail(401, 'Current password is incorrect');
  }
  db()->prepare('UPDATE users SET password_hash = ? WHERE id = ?')
    ->execute([password_hash($new, PASSWORD_BCRYPT, ['cost' => 11]), $user['id']]);
  send(200, ['ok' => true]);
}

if ($method === 'GET' && $path === '/content') {
  $out = ['singles' => (object)[], 'collections' => (object)[]];
  $singles = [];
  foreach (db()->query('SELECT k, data FROM content') as $row) $singles[$row['k']] = json_col($row['data']);
  $collections = [];
  $q = db()->query('SELECT id, collection, data, sort FROM items WHERE published = 1 ORDER BY collection, sort, id');
  foreach ($q as $row) {
    $collections[$row['collection']][] = array_merge(['id' => (int)$row['id']], json_col($row['data']) ?: []);
  }
  if ($singles) $out['singles'] = $singles;
  if ($collections) $out['collections'] = $collections;
  send(200, $out, ['Cache-Control' => 'public, max-age=60']);
}

if ($method === 'POST' && $path === '/submit') {
  rate_limit('submit', 60, 6);
  $b = body_json();
  if (!empty($b['website'])) send(200, ['ok' => true]); // honeypot: real users never fill "website"
  $kind = $b['kind'] ?? '';
  if (!in_array($kind, ['volunteer', 'membership', 'contact'], true)) fail(400, 'Bad submission type');
  $name = (string)($b['name'] ?? '');
  if ($name === '' || mb_strlen($name) > 190) fail(400, 'Name is required');
  $email = (string)($b['email'] ?? '');
  if (!$email || !preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) fail(400, 'A valid email is required');
  $extra = array_diff_key($b, array_flip(['kind', 'name', 'email', 'phone', 'message', 'website']));
  db()->prepare('INSERT INTO submissions (kind, name, email, phone, message, extra) VALUES (?,?,?,?,?,?)')
    ->execute([
      $kind, mb_substr($name, 0, 190), $email,
      mb_substr((string)($b['phone'] ?? ''), 0, 64) ?: null,
      mb_substr((string)($b['message'] ?? ''), 0, 5000) ?: null,
      $extra ? json_encode($extra, JSON_UNESCAPED_UNICODE) : null,
    ]);
  notify(
    "New $kind request — rtgeth.org",
    "A new $kind request arrived via the website:\n\n"
    . 'Name:    ' . mb_substr($name, 0, 190) . "\n"
    . "Email:   $email\n"
    . 'Phone:   ' . (mb_substr((string)($b['phone'] ?? ''), 0, 64) ?: '—') . "\n"
    . 'Message: ' . (mb_substr((string)($b['message'] ?? ''), 0, 5000) ?: '—') . "\n\n"
    . 'Reply directly to this email, or manage it at https://rtgeth.org/admin/submissions',
    $email
  );
  send(201, ['ok' => true]);
}

/* ---------- Chapa donations (port of routes/chapa.js — security rules preserved) ---------- */

if ($method === 'POST' && $path === '/donate/init') {
  rate_limit('donate-init', 60, 8);
  $c = cfg();
  $b = body_json();
  $min = (float)($c['DONATION_MIN'] ?? 10);
  $max = (float)($c['DONATION_MAX'] ?? 1000000);
  $amt = round((float)($b['amount'] ?? 0) * 100) / 100;
  if (!is_finite($amt) || $amt < $min || $amt > $max) {
    fail(400, sprintf('Amount must be between %s and %s', number_format($min), number_format($max)));
  }
  $currency = $b['currency'] ?? 'ETB';
  if (!in_array($currency, ['ETB', 'USD'], true)) fail(400, 'Unsupported currency');
  $email = (string)($b['email'] ?? '');
  if (!$email || !preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) fail(400, 'A valid email is required');
  $first = (string)($b['first_name'] ?? '');
  if ($first === '' || mb_strlen($first) > 120) fail(400, 'First name is required');
  $purpose = in_array($b['purpose'] ?? '', ['GENERAL', 'GAMO', 'MEMBER'], true) ? $b['purpose'] : 'GENERAL';

  $txRef = make_tx_ref();
  /* persist BEFORE calling Chapa — the stored amount is the security anchor */
  db()->prepare('INSERT INTO donations (tx_ref, amount, currency, first_name, last_name, email, purpose, status) VALUES (?,?,?,?,?,?,?,?)')
    ->execute([$txRef, $amt, $currency, mb_substr($first, 0, 120), mb_substr((string)($b['last_name'] ?? ''), 0, 120), $email, $purpose, 'initialized']);

  $payload = [
    'amount' => (string)$amt, // Chapa wants the amount as a string
    'currency' => $currency,
    'email' => $email,
    'first_name' => mb_substr($first, 0, 120),
    'last_name' => mb_substr((string)($b['last_name'] ?? ''), 0, 120),
    'tx_ref' => $txRef,
    'callback_url' => rtrim($c['API_ORIGIN'], '/') . '/api/chapa/webhook',
    'return_url' => site_origins()[0] . '/donate/thanks?tx_ref=' . rawurlencode($txRef),
    'customization' => [
      'title' => 'Rescue The Gen.', // Chapa caps title at 16 chars
      'description' => $purpose === 'GAMO' ? 'Gamo landslide relief' : 'Donation to Rescue The Generation',
    ],
  ];
  if (!empty($b['phone'])) $payload['phone_number'] = mb_substr((string)$b['phone'], 0, 32);

  $r = chapa_request('POST', '/transaction/initialize', $payload);
  if (!$r['ok']) {
    error_log('Chapa init failed ' . $r['status'] . ' ' . json_encode($r['body']));
    db()->prepare("UPDATE donations SET status = 'failed' WHERE tx_ref = ?")->execute([$txRef]);
    fail(502, $r['body']['message'] ?? 'Payment provider unavailable — try again shortly');
  }
  $checkoutUrl = $r['body']['data']['checkout_url'] ?? null;
  if (!$checkoutUrl) {
    db()->prepare("UPDATE donations SET status = 'failed' WHERE tx_ref = ?")->execute([$txRef]);
    fail(502, 'Payment provider did not return a checkout page');
  }
  db()->prepare("UPDATE donations SET status = 'pending' WHERE tx_ref = ?")->execute([$txRef]);
  send(200, ['checkout_url' => $checkoutUrl, 'tx_ref' => $txRef]);
}

/* shared verification gate — webhook and status poll use the SAME rules.
   $throttleSec > 0 (status polls) skips the outbound Chapa call when this
   tx_ref was verified moments ago; the webhook always verifies. */
function verify_and_settle(string $txRef, int $throttleSec = 0): array {
  $st = db()->prepare('SELECT * FROM donations WHERE tx_ref = ?');
  $st->execute([$txRef]);
  $donation = $st->fetch();
  if (!$donation) return ['ok' => false, 'code' => 404, 'msg' => 'Unknown transaction', 'donation' => null];
  if ($donation['status'] === 'success') return ['ok' => true, 'donation' => $donation, 'already' => true];

  if ($throttleSec > 0) {
    $dir = cfg()['RATE_DIR'] ?? (sys_get_temp_dir() . '/rtg-rate');
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    $marker = $dir . '/verify-' . md5($txRef);
    $last = @filemtime($marker);
    if ($last && time() - $last < $throttleSec) {
      return ['ok' => false, 'code' => 200, 'msg' => 'Recently checked', 'donation' => $donation];
    }
    @touch($marker);
  }

  $r = chapa_request('GET', '/transaction/verify/' . rawurlencode($txRef));
  if ($r['body'] === null) return ['ok' => false, 'code' => 502, 'msg' => 'Verification unavailable', 'donation' => $donation];
  $v = $r['body']['data'] ?? [];
  $status = strtolower((string)($v['status'] ?? $r['body']['status'] ?? ''));
  if (!in_array($status, ['success', 'completed', 'paid'], true)) {
    return ['ok' => false, 'code' => 200, 'msg' => 'Not confirmed (' . ($status ?: 'pending') . ')', 'donation' => $donation];
  }
  $verifiedAmount = (float)($v['amount'] ?? 0);
  /* zero/missing verified amount is a MISMATCH — fail closed */
  if (!is_finite($verifiedAmount) || abs($verifiedAmount - (float)$donation['amount']) > 0.01) {
    db()->prepare("UPDATE donations SET status = 'failed', raw_verify = ? WHERE tx_ref = ?")
      ->execute([json_encode($v, JSON_UNESCAPED_UNICODE), $txRef]);
    return ['ok' => false, 'code' => 200, 'msg' => 'Amount mismatch', 'donation' => $donation];
  }
  $st = db()->prepare("UPDATE donations SET status = 'success', chapa_ref_id = ?, raw_verify = ?, verified_at = NOW() WHERE tx_ref = ? AND status != 'success'");
  $st->execute([$v['reference'] ?? null, json_encode($v, JSON_UNESCAPED_UNICODE), $txRef]);
  /* rowCount guards the webhook/poll race: only the request that flipped the row notifies */
  if ($st->rowCount()) {
    notify(
      "Donation confirmed — {$donation['amount']} {$donation['currency']}",
      "A donation was confirmed via Chapa:\n\n"
      . "Amount:    {$donation['amount']} {$donation['currency']}\n"
      . "Purpose:   {$donation['purpose']}\n"
      . 'Donor:     ' . trim(($donation['first_name'] ?? '') . ' ' . ($donation['last_name'] ?? '')) . "\n"
      . 'Email:     ' . ($donation['email'] ?? '—') . "\n"
      . "Reference: $txRef\n\n"
      . 'Full ledger: https://rtgeth.org/admin/donations'
    );
  }
  $donation['status'] = 'success';
  return ['ok' => true, 'donation' => $donation];
}

if ($method === 'POST' && $path === '/chapa/webhook') {
  $raw = file_get_contents('php://input') ?: '';
  if ($raw === '') send(400, ['status' => 'error', 'message' => 'Empty payload']);

  $secret = cfg()['CHAPA_WEBHOOK_SECRET'] ?? '';
  $sigHeaders = array_values(array_filter([
    $_SERVER['HTTP_CHAPA_SIGNATURE'] ?? null,
    $_SERVER['HTTP_X_CHAPA_SIGNATURE'] ?? null,
  ]));
  if ($secret !== '') {
    /* Chapa sends two headers with different meanings: HMAC(body) and HMAC(secret) — accept either */
    $sigBody = hash_hmac('sha256', $raw, $secret);
    $sigSecret = hash_hmac('sha256', $secret, $secret);
    $match = false;
    foreach ($sigHeaders as $h) {
      if (hash_equals($sigBody, (string)$h) || hash_equals($sigSecret, (string)$h)) { $match = true; break; }
    }
    if (!$match) send(401, ['status' => 'error', 'message' => 'Invalid signature']);
  } elseif (!$sigHeaders) {
    error_log('Chapa webhook: no CHAPA_WEBHOOK_SECRET configured and no signature header — relying on re-verification only');
  }

  $data = json_decode($raw, true);
  if (!is_array($data)) send(400, ['status' => 'error', 'message' => 'Bad JSON']);

  $txRef = $data['tx_ref'] ?? $data['trx_ref'] ?? '';
  $status = strtolower((string)($data['status'] ?? ''));
  $event = $data['event'] ?? '';
  if (!$txRef && isset($data['data']) && is_array($data['data'])) {
    $txRef = $data['data']['tx_ref'] ?? '';
    $status = strtolower((string)($data['data']['status'] ?? $status));
  }
  if (!$txRef) send(400, ['status' => 'error', 'message' => 'Missing transaction reference']);

  $isSuccess = $event === 'charge.success' || in_array($status, ['success', 'completed', 'paid'], true);
  $isFailure = in_array($event, ['charge.failed', 'charge.cancelled'], true) || in_array($status, ['failed', 'cancelled'], true);

  if ($isSuccess) {
    $result = verify_and_settle((string)$txRef);
    if (!empty($result['already'])) send(200, ['status' => 'success', 'message' => 'Already processed']);
    if (!$result['ok']) send($result['code'] === 404 ? 404 : 200, ['status' => 'error', 'message' => $result['msg']]);
    send(200, ['status' => 'success', 'message' => 'Donation recorded']);
  }
  if ($isFailure) {
    db()->prepare("UPDATE donations SET status = 'failed' WHERE tx_ref = ? AND status != 'success'")->execute([(string)$txRef]);
    send(200, ['status' => 'ok', 'message' => 'Failure recorded']);
  }
  send(200, ['status' => 'ok', 'message' => 'Event recorded']);
}

if ($method === 'GET' && $path === '/donate/status') {
  $txRef = (string)($_GET['tx_ref'] ?? '');
  if (!preg_match('/^RTG-\d{14}-[0-9A-F]{6}$/', $txRef)) fail(400, 'Bad reference');
  /* bucket per donation, not per IP alone — donors behind one NAT must not starve each other */
  rate_limit('donate-status:' . $txRef, 60, 30);
  $result = verify_and_settle($txRef, 10);
  if (!$result['donation']) fail(404, 'Unknown transaction');
  $d = $result['donation'];
  send(200, [
    'tx_ref' => $txRef,
    'status' => $d['status'],
    'amount' => $d['amount'],
    'currency' => $d['currency'],
    'purpose' => $d['purpose'],
    'first_name' => $d['first_name'],
  ]);
}

/* ---------- admin: singletons ---------- */

if (preg_match('#^/admin/content/([^/]+)$#', $path, $m)) {
  $u = require_admin();
  $key = $m[1];
  if (!valid_key($key)) fail(400, 'Bad key');
  if ($method === 'GET') {
    $st = db()->prepare('SELECT data FROM content WHERE k = ?');
    $st->execute([$key]);
    $row = $st->fetch();
    send(200, $row ? json_col($row['data']) : null);
  }
  if ($method === 'PUT') {
    /* merge-save like GSTS setDoc(..., {merge:true}) — partial saves never clobber */
    $st = db()->prepare('SELECT data FROM content WHERE k = ?');
    $st->execute([$key]);
    $row = $st->fetch();
    $current = $row ? (json_col($row['data']) ?: []) : [];
    $merged = array_merge($current, body_json());
    db()->prepare('INSERT INTO content (k, data, updated_by) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), updated_by = VALUES(updated_by)')
      ->execute([$key, json_encode($merged, JSON_UNESCAPED_UNICODE), $u['email']]);
    send(200, $merged ?: (object)[]);
  }
  fail(405, 'Method not allowed');
}

/* ---------- admin: generic collections ---------- */

if (preg_match('#^/admin/items/([^/]+)/reorder$#', $path, $m) && $method === 'POST') {
  require_admin();
  $collection = $m[1];
  if (!valid_key($collection)) fail(400, 'Bad collection');
  $order = body_json()['order'] ?? null;
  if (!is_array($order)) fail(400, 'order must be an array of ids');
  $pdo = db();
  $pdo->beginTransaction();
  try {
    $st = $pdo->prepare('UPDATE items SET sort = ? WHERE collection = ? AND id = ?');
    foreach (array_values($order) as $i => $id) $st->execute([$i + 1, $collection, (int)$id]);
    $pdo->commit();
  } catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
  }
  send(200, ['ok' => true]);
}

if (preg_match('#^/admin/items/([^/]+)/(\d+)$#', $path, $m)) {
  require_admin();
  [, $collection, $id] = $m;
  if (!valid_key($collection)) fail(400, 'Bad collection');
  if ($method === 'PUT') {
    $b = body_json();
    $published = $b['published'] ?? null; $sort = $b['sort'] ?? null;
    unset($b['published'], $b['sort']);
    $sets = ['data = ?']; $args = [json_encode($b, JSON_UNESCAPED_UNICODE)];
    if ($published !== null) { $sets[] = 'published = ?'; $args[] = $published ? 1 : 0; }
    if ($sort !== null) { $sets[] = 'sort = ?'; $args[] = (int)$sort; }
    $args[] = $collection; $args[] = (int)$id;
    $st = db()->prepare('UPDATE items SET ' . implode(', ', $sets) . ' WHERE collection = ? AND id = ?');
    $st->execute($args);
    if (!$st->rowCount()) fail(404, 'Not found');
    send(200, ['ok' => true]);
  }
  if ($method === 'DELETE') {
    $st = db()->prepare('DELETE FROM items WHERE collection = ? AND id = ?');
    $st->execute([$collection, (int)$id]);
    if (!$st->rowCount()) fail(404, 'Not found');
    send(200, ['ok' => true]);
  }
  fail(405, 'Method not allowed');
}

if (preg_match('#^/admin/items/([^/]+)$#', $path, $m)) {
  require_admin();
  $collection = $m[1];
  if (!valid_key($collection)) fail(400, 'Bad collection');
  if ($method === 'GET') {
    $st = db()->prepare('SELECT id, data, sort, published, updated_at FROM items WHERE collection = ? ORDER BY sort, id');
    $st->execute([$collection]);
    $out = [];
    foreach ($st as $r) {
      $out[] = array_merge([
        'id' => (int)$r['id'],
        'sort' => (int)$r['sort'],
        'published' => (bool)$r['published'],
        'updatedAt' => iso($r['updated_at']),
      ], json_col($r['data']) ?: []);
    }
    send(200, $out);
  }
  if ($method === 'POST') {
    $b = body_json();
    $published = array_key_exists('published', $b) ? (bool)$b['published'] : true;
    $sort = $b['sort'] ?? null;
    unset($b['published'], $b['sort']);
    $st = db()->prepare('SELECT COALESCE(MAX(sort), 0) AS maxSort FROM items WHERE collection = ?');
    $st->execute([$collection]);
    $maxSort = (int)$st->fetch()['maxSort'];
    db()->prepare('INSERT INTO items (collection, data, sort, published) VALUES (?, ?, ?, ?)')
      ->execute([$collection, json_encode($b, JSON_UNESCAPED_UNICODE), $sort !== null ? (int)$sort : $maxSort + 1, $published ? 1 : 0]);
    send(201, ['id' => (int)db()->lastInsertId()]);
  }
  fail(405, 'Method not allowed');
}

/* ---------- admin: uploads ---------- */

/* web images get resized to a sane width — an 8 MB phone photo must not land on the homepage */
function shrink_image(string $path, string $mime, int $maxW = 1600): void {
  if (!function_exists('imagecreatefromjpeg')) return; // no GD: keep the original
  $info = @getimagesize($path);
  if (!$info) return;
  [$w, $h] = $info;
  if ($w * $h > 40_000_000) return; // absurd pixel counts would exhaust shared-hosting memory
  if ($w <= $maxW) return;
  $src = match ($mime) {
    'image/jpeg' => @imagecreatefromjpeg($path),
    'image/png' => @imagecreatefrompng($path),
    'image/webp' => function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($path) : null,
    default => null,
  };
  if (!$src) return;
  $dst = imagescale($src, $maxW);
  imagedestroy($src);
  if (!$dst) return;
  match ($mime) {
    'image/jpeg' => imagejpeg($dst, $path, 84),
    'image/png' => imagepng($dst, $path, 8),
    'image/webp' => imagewebp($dst, $path, 84),
  };
  imagedestroy($dst);
}

if ($method === 'POST' && $path === '/admin/upload') {
  require_admin();
  $allowed = ['image/jpeg' => '.jpg', 'image/png' => '.png', 'image/webp' => '.webp', 'image/svg+xml' => '.svg', 'application/pdf' => '.pdf'];
  $f = $_FILES['file'] ?? null;
  if (!$f || $f['error'] === UPLOAD_ERR_NO_FILE) fail(400, 'No file received');
  if ($f['error'] !== UPLOAD_ERR_OK) fail(400, 'Upload failed (code ' . $f['error'] . ')');
  if ($f['size'] > 8 * 1024 * 1024) fail(400, 'File too large (max 8 MB)');
  $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']) ?: '';
  if (!isset($allowed[$mime])) fail(400, 'Only JPG, PNG, WebP, SVG or PDF files are allowed');
  $dir = cfg()['UPLOAD_DIR'];
  if (!is_dir($dir)) mkdir($dir, 0755, true);
  $name = round(microtime(true) * 1000) . '-' . bin2hex(random_bytes(4)) . $allowed[$mime];
  if (!move_uploaded_file($f['tmp_name'], "$dir/$name")) fail(500, 'Could not store file');
  if (in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) shrink_image("$dir/$name", $mime);
  send(201, ['url' => "/uploads/$name", 'size' => (int)(filesize("$dir/$name") ?: $f['size']), 'name' => $f['name']]);
}

if ($method === 'GET' && $path === '/admin/uploads') {
  require_admin();
  $dir = cfg()['UPLOAD_DIR'];
  $out = [];
  foreach (is_dir($dir) ? scandir($dir) : [] as $name) {
    $p = "$dir/$name";
    if ($name[0] === '.' || !is_file($p)) continue;
    $out[] = ['name' => $name, 'url' => "/uploads/$name", 'size' => (int)filesize($p), 'mtime' => date('c', (int)filemtime($p))];
  }
  usort($out, fn ($a, $b) => strcmp($b['mtime'], $a['mtime']));
  send(200, $out);
}

if ($method === 'DELETE' && preg_match('#^/admin/upload/([^/]+)$#', $path, $m)) {
  require_admin();
  $name = basename($m[1]); // no traversal
  $target = cfg()['UPLOAD_DIR'] . '/' . $name;
  if (!is_file($target)) fail(404, 'Not found');
  unlink($target);
  send(200, ['ok' => true]);
}

/* ---------- admin: dashboards ---------- */

if ($method === 'GET' && $path === '/admin/donations') {
  require_admin();
  $rows = [];
  $q = db()->query('SELECT id, tx_ref, amount, currency, first_name, last_name, email, purpose, status, created_at, verified_at FROM donations ORDER BY created_at DESC LIMIT 500');
  foreach ($q as $r) {
    $r['id'] = (int)$r['id'];
    $r['created_at'] = iso($r['created_at']);
    $r['verified_at'] = iso($r['verified_at']);
    $rows[] = $r;
  }
  send(200, $rows);
}

if ($method === 'GET' && $path === '/admin/submissions') {
  require_admin();
  $kinds = ['volunteer', 'membership', 'contact'];
  $kind = in_array($_GET['kind'] ?? '', $kinds, true) ? $_GET['kind'] : null;
  $sql = 'SELECT id, kind, name, email, phone, message, extra, is_read, created_at FROM submissions '
       . ($kind ? 'WHERE kind = ? ' : '') . 'ORDER BY created_at DESC LIMIT 500';
  $st = db()->prepare($sql);
  $st->execute($kind ? [$kind] : []);
  $rows = [];
  foreach ($st as $r) {
    $r['id'] = (int)$r['id'];
    $r['is_read'] = (int)$r['is_read'];
    $r['extra'] = json_col($r['extra']);
    $r['created_at'] = iso($r['created_at']);
    $rows[] = $r;
  }
  send(200, $rows);
}

if ($method === 'PUT' && preg_match('#^/admin/submissions/(\d+)/read$#', $path, $m)) {
  require_admin();
  db()->prepare('UPDATE submissions SET is_read = 1 WHERE id = ?')->execute([(int)$m[1]]);
  send(200, ['ok' => true]);
}

fail(404, 'Not found');
