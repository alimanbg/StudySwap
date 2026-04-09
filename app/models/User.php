<?php
require_once __DIR__ . '/../core/Model.php';

class User extends Model
{
    public function create(string $fullName, string $email, string $passwordHash): bool
    {
        $stmt = $this->db()->prepare("INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'student')");
        return $stmt->execute([$fullName, $email, $passwordHash]);
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db()->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->db()->prepare("SELECT id, full_name, email, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
