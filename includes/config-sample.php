<?php
// Database configuration – copy this file to config.php and fill in your credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'study_swap');
define('DB_USER', 'root');
define('DB_PASS', '');

// Establish connection (example using PDO)
try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
