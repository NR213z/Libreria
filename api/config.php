<?php
// ── Configuración de base de datos ──────────────────────────────────────────
// Completar con los datos de tu cPanel
define('DB_HOST', 'localhost');
define('DB_NAME', 'NOMBRE_DE_TU_BASE_DE_DATOS');
define('DB_USER', 'USUARIO_DE_LA_BASE');
define('DB_PASS', 'CONTRASEÑA_DE_LA_BASE');

// ── JWT Secret (debe ser igual al de .env.local) ────────────────────────────
define('JWT_SECRET', '0d13c0ce7948e5a7951f882de0083d74fc0cdd4311f02218acd0acd0a5de4555308baae15f1aacf54df0112752a2ce059fc2688ca5fae90ffeba14a7be97d07e');

// ── Conexión PDO ─────────────────────────────────────────────────────────────
function getDB(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $pdo = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER, DB_PASS,
            [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
        );
    }
    return $pdo;
}

// ── JWT ───────────────────────────────────────────────────────────────────────
function b64url(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
function b64url_decode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
}

function jwt_sign(array $payload): string {
    $header  = b64url(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload = array_merge($payload, ['iat' => time(), 'exp' => time() + 8 * 3600]);
    $body    = b64url(json_encode($payload));
    $sig     = b64url(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    return "$header.$body.$sig";
}

function jwt_verify(string $token): array|false {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return false;
    [$header, $body, $sig] = $parts;
    $expected = b64url(hash_hmac('sha256', "$header.$body", JWT_SECRET, true));
    if (!hash_equals($expected, $sig)) return false;
    $data = json_decode(b64url_decode($body), true);
    if (!$data || ($data['exp'] ?? 0) < time()) return false;
    return $data;
}

// ── Helpers HTTP ──────────────────────────────────────────────────────────────
function json_out(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function get_token(): array|false {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $auth, $m)) return false;
    return jwt_verify(trim($m[1]));
}

function require_admin(): array {
    $decoded = get_token();
    if (!$decoded)                    json_out(['error' => 'No autenticado'], 401);
    if ($decoded['role'] !== 'admin') json_out(['error' => 'Se requiere rol de administrador'], 403);
    return $decoded;
}

function body(): array {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}
