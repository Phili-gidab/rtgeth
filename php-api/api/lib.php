<?php
/*
 * RTG CMS API — shared helpers (PHP port of server/src).
 * Zero dependencies: PDO MySQL, hash_hmac JWT (HS256), password_verify (bcrypt),
 * curl for Chapa. Config lives OUTSIDE the docroot (~/rtg-api-config.php).
 */

declare(strict_types=1);

function cfg(): array {
  static $cfg = null;
  if ($cfg !== null) return $cfg;
  $candidates = [
    dirname($_SERVER['DOCUMENT_ROOT'] ?? dirname(__DIR__, 2)) . '/rtg-api-config.php',
    dirname(__DIR__, 3) . '/rtg-api-config.php',
    dirname(__DIR__) . '/config.php', // local dev fallback
  ];
  foreach ($candidates as $p) {
    if (is_file($p)) { $cfg = require $p; return $cfg; }
  }
  http_response_code(500);
  header('Content-Type: application/json');
  echo '{"error":"API not configured"}';
  exit;
}

function db(): PDO {
  static $pdo = null;
  if ($pdo !== null) return $pdo;
  $c = cfg();
  $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
    $c['DB_HOST'] ?? '127.0.0.1', (int)($c['DB_PORT'] ?? 3306), $c['DB_NAME']);
  $pdo = new PDO($dsn, $c['DB_USER'], $c['DB_PASSWORD'], [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false, // native types: INT columns come back as ints
  ]);
  return $pdo;
}

/* ---------- responses ---------- */

function send(int $status, $data, array $headers = []): void {
  http_response_code($status);
  header('Content-Type: application/json; charset=utf-8');
  foreach ($headers as $k => $v) header("$k: $v");
  echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
  exit;
}

function fail(int $status, string $msg): void { send($status, ['error' => $msg]); }

function body_json(): array {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw ?: '', true);
  return is_array($data) ? $data : [];
}

function iso(?string $ts): ?string { return $ts ? date('c', strtotime($ts)) : null; }

/* ---------- auth (JWT HS256, mirrors middleware/auth.js) ---------- */

function b64url_encode(string $s): string { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function b64url_decode(string $s): string|false { return base64_decode(strtr($s, '-_', '+/')); }

function jwt_sign(array $user): string {
  $c = cfg();
  $header = b64url_encode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
  $now = time();
  $payload = b64url_encode(json_encode([
    'sub' => $user['id'], 'email' => $user['email'], 'role' => $user['role'],
    'iat' => $now, 'exp' => $now + 12 * 3600,
  ]));
  $sig = b64url_encode(hash_hmac('sha256', "$header.$payload", $c['JWT_SECRET'], true));
  return "$header.$payload.$sig";
}

function jwt_verify(string $token): ?array {
  $c = cfg();
  $parts = explode('.', $token);
  if (count($parts) !== 3) return null;
  [$header, $payload, $sig] = $parts;
  $expected = b64url_encode(hash_hmac('sha256', "$header.$payload", $c['JWT_SECRET'], true));
  if (!hash_equals($expected, $sig)) return null;
  $data = json_decode(b64url_decode($payload) ?: '', true);
  if (!is_array($data) || !isset($data['exp']) || $data['exp'] < time()) return null;
  return $data;
}

function bearer_token(): ?string {
  $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
  if (!$h && function_exists('getallheaders')) {
    foreach (getallheaders() as $k => $v) if (strcasecmp($k, 'Authorization') === 0) { $h = $v; break; }
  }
  return str_starts_with($h, 'Bearer ') ? substr($h, 7) : null;
}

function require_admin(): array {
  $token = bearer_token();
  if (!$token) fail(401, 'Not authenticated');
  $payload = jwt_verify($token);
  if (!$payload) fail(401, 'Session expired — log in again');
  if (!in_array($payload['role'] ?? '', ['super_admin', 'admin', 'editor'], true)) fail(403, 'Forbidden');
  return $payload;
}

/* ---------- rate limiting (fixed window, file-based — mirrors auth.js rateLimit) ---------- */

function rate_limit(string $bucket, int $windowSec, int $max): void {
  $dir = cfg()['RATE_DIR'] ?? (sys_get_temp_dir() . '/rtg-rate');
  if (!is_dir($dir)) @mkdir($dir, 0700, true);
  $ip = $_SERVER['REMOTE_ADDR'] ?? '0';
  $file = $dir . '/' . md5("$ip:$bucket") . '.json';
  $fh = fopen($file, 'c+');
  if (!$fh) return; // fail open on limiter storage errors — same as losing the in-memory map
  flock($fh, LOCK_EX);
  $entry = json_decode(stream_get_contents($fh) ?: '', true) ?: null;
  $now = time();
  if (!$entry || $now - $entry['start'] > $windowSec) $entry = ['start' => $now, 'count' => 1];
  else $entry['count']++;
  ftruncate($fh, 0); rewind($fh);
  fwrite($fh, json_encode($entry));
  flock($fh, LOCK_UN); fclose($fh);
  if ($entry['count'] > $max) fail(429, 'Too many requests — try again shortly');
}

/* ---------- misc ---------- */

function valid_key(string $k): bool { return (bool)preg_match('/^[a-z][a-z0-9_-]{1,63}$/', $k); }

function json_col($v) { return is_string($v) ? json_decode($v, true) : $v; }

function site_origins(): array {
  return array_values(array_filter(array_map('trim', explode(',', cfg()['SITE_ORIGIN'] ?? ''))));
}

/* Same-origin deploys don't need CORS; kept for the www./bare-domain pair and future subdomain use. */
function apply_cors(): void {
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if ($origin && in_array($origin, site_origins(), true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
  }
  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
}

/* ---------- Chapa HTTP (curl port of the axios client) ---------- */

function chapa_request(string $method, string $path, ?array $payload = null): array {
  $c = cfg();
  $ch = curl_init('https://api.chapa.co/v1' . $path);
  $headers = ['Content-Type: application/json', 'Authorization: Bearer ' . ($c['CHAPA_SECRET_KEY'] ?? '')];
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTPHEADER => $headers,
    CURLOPT_CUSTOMREQUEST => $method,
  ]);
  if ($payload !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload, JSON_UNESCAPED_UNICODE));
  $bodyRaw = curl_exec($ch);
  $status = (int)curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  if ($bodyRaw === false) return ['ok' => false, 'status' => 0, 'body' => null, 'error' => $err];
  $body = json_decode($bodyRaw, true);
  return ['ok' => $status >= 200 && $status < 300, 'status' => $status, 'body' => $body, 'error' => null];
}

function make_tx_ref(): string {
  return 'RTG-' . gmdate('YmdHis') . '-' . strtoupper(bin2hex(random_bytes(3)));
}
