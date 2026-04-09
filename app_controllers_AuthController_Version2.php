<?php
require_once __DIR__ . '/../models/User.php';

class AuthController
{
    private User $users;

    public function __construct()
    {
        $this->users = new User();
        if (session_status() === PHP_SESSION_NONE) session_start();
    }

    public function register(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $fullName = trim($data['full_name'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if ($fullName === '' || $email === '' || strlen($password) < 6) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'full_name, email and password(>=6) are required']);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Invalid email']);
            return;
        }

        if ($this->users->findByEmail($email)) {
            http_response_code(409);
            echo json_encode(['success' => false, 'message' => 'Email already exists']);
            return;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $this->users->create($fullName, $email, $hash);

        echo json_encode(['success' => true, 'message' => 'Registered successfully']);
    }

    public function login(): void
    {
        $data = json_decode(file_get_contents('php://input'), true) ?? [];

        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        $user = $this->users->findByEmail($email);
        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Invalid credentials']);
            return;
        }

        $_SESSION['user'] = [
            'id' => (int)$user['id'],
            'full_name' => $user['full_name'],
            'email' => $user['email'],
            'role' => $user['role'],
        ];

        echo json_encode(['success' => true, 'message' => 'Login successful', 'user' => $_SESSION['user']]);
    }

    public function logout(): void
    {
        $_SESSION = [];
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logged out']);
    }

    public function me(): void
    {
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Not logged in']);
            return;
        }

        echo json_encode(['success' => true, 'user' => $_SESSION['user']]);
    }
}