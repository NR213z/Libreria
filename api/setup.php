<?php
/**
 * SETUP — Ejecutar UNA SOLA VEZ para crear la tabla y el usuario admin.
 * Luego ELIMINAR este archivo del servidor.
 *
 * Acceder desde el navegador: https://libreria.iurd.com.ar/api/setup.php
 */
require_once __DIR__ . '/config.php';

try {
    $db = getDB();

    // Crear tabla usuarios
    $db->exec("
        CREATE TABLE IF NOT EXISTS users (
            id           INT AUTO_INCREMENT PRIMARY KEY,
            email        VARCHAR(255) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            role         ENUM('admin','usuario') NOT NULL DEFAULT 'usuario',
            created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    // Insertar admin solo si no existe
    $stmt = $db->prepare('SELECT COUNT(*) FROM users WHERE email = ?');
    $stmt->execute(['nrios@iurd.com.ar']);

    if ($stmt->fetchColumn() == 0) {
        $hash = password_hash('libreria2024', PASSWORD_BCRYPT);
        $db->prepare('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)')
           ->execute(['nrios@iurd.com.ar', $hash, 'admin']);
        echo "✅ Tabla creada y usuario admin insertado.<br>";
        echo "📧 nrios@iurd.com.ar<br>";
        echo "🔑 libreria2024<br>";
    } else {
        echo "✅ Tabla creada (el usuario admin ya existía).<br>";
    }

    echo "<br><strong>⚠️ IMPORTANTE: Eliminá este archivo (setup.php) del servidor ahora.</strong>";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
