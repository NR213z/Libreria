<?php
// ── CORS ──────────────────────────────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// Extraer la parte del path después de /api
$uri  = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = preg_replace('#^.*/api/?#', '', $uri);
$path = trim($path, '/');
$segs = $path !== '' ? explode('/', $path) : [];

$body = body();

// ════════════════════════════════════════════════════════════════════════════
// /api/auth/login   POST
// /api/auth/me      GET
// ════════════════════════════════════════════════════════════════════════════
if (($segs[0] ?? '') === 'auth') {

    if (($segs[1] ?? '') === 'login' && $method === 'POST') {
        $email    = strtolower(trim($body['email']    ?? ''));
        $password = $body['password'] ?? '';

        if (!$email || !$password)
            json_out(['error' => 'Email y contraseña requeridos'], 400);

        $stmt = getDB()->prepare('SELECT * FROM users WHERE email = ?');
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user || !password_verify($password, $user['password_hash']))
            json_out(['error' => 'Email o contraseña incorrectos'], 401);

        $token = jwt_sign(['email' => $user['email'], 'role' => $user['role']]);
        json_out(['token' => $token, 'email' => $user['email'], 'role' => $user['role']]);
    }

    if (($segs[1] ?? '') === 'me' && $method === 'GET') {
        $decoded = get_token();
        if (!$decoded) json_out(['error' => 'No autenticado'], 401);

        $stmt = getDB()->prepare('SELECT email, role FROM users WHERE email = ?');
        $stmt->execute([$decoded['email']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$user) json_out(['error' => 'Usuario eliminado del sistema'], 403);
        json_out(['email' => $user['email'], 'role' => $user['role']]);
    }
}

// ════════════════════════════════════════════════════════════════════════════
// /api/users                        GET, POST
// /api/users/:email/password        PUT
// /api/users/:email                 DELETE
// ════════════════════════════════════════════════════════════════════════════
if (($segs[0] ?? '') === 'users') {

    // GET /api/users
    if ($method === 'GET' && !isset($segs[1])) {
        require_admin();
        $rows = getDB()->query(
            'SELECT email, role, created_at AS createdAt FROM users ORDER BY created_at'
        )->fetchAll(PDO::FETCH_ASSOC);
        json_out($rows);
    }

    // POST /api/users
    if ($method === 'POST' && !isset($segs[1])) {
        require_admin();
        $email    = strtolower(trim($body['email']    ?? ''));
        $password = $body['password'] ?? '';
        $role     = $body['role']     ?? 'usuario';

        if (!$email || !$password)
            json_out(['error' => 'Email y contraseña requeridos'], 400);
        if (!in_array($role, ['admin', 'usuario'], true))
            json_out(['error' => 'Rol inválido'], 400);

        try {
            $stmt = getDB()->prepare(
                'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)'
            );
            $stmt->execute([$email, password_hash($password, PASSWORD_BCRYPT), $role]);
            json_out(['ok' => true]);
        } catch (PDOException) {
            json_out(['error' => 'Ese email ya está registrado'], 409);
        }
    }

    // PUT /api/users/:email/password
    if ($method === 'PUT' && isset($segs[1]) && ($segs[2] ?? '') === 'password') {
        require_admin();
        $email    = urldecode($segs[1]);
        $password = $body['password'] ?? '';

        if (!$password || strlen($password) < 4)
            json_out(['error' => 'La contraseña debe tener al menos 4 caracteres'], 400);

        $stmt = getDB()->prepare(
            'UPDATE users SET password_hash = ? WHERE email = ?'
        );
        $stmt->execute([password_hash($password, PASSWORD_BCRYPT), $email]);

        if ($stmt->rowCount() === 0) json_out(['error' => 'Usuario no encontrado'], 404);
        json_out(['ok' => true]);
    }

    // DELETE /api/users/:email
    if ($method === 'DELETE' && isset($segs[1]) && !isset($segs[2])) {
        require_admin();
        $email = urldecode($segs[1]);
        $stmt  = getDB()->prepare('DELETE FROM users WHERE email = ?');
        $stmt->execute([$email]);
        json_out(['ok' => true]);
    }
}

json_out(['error' => 'Ruta no encontrada'], 404);
