<?php
require_once __DIR__ . '/../core/Model.php';

class Item extends Model
{
    public function create(int $ownerId, string $title, string $category, string $description): bool
    {
        $stmt = $this->db()->prepare("
            INSERT INTO items (owner_id, title, category, description, status)
            VALUES (?, ?, ?, ?, 'available')
        ");
        return $stmt->execute([$ownerId, $title, $category, $description]);
    }

    public function allAvailable(): array
    {
        $sql = "
            SELECT i.id, i.title, i.category, i.description, i.status, i.created_at,
                   u.full_name AS owner_name
            FROM items i
            JOIN users u ON u.id = i.owner_id
            WHERE i.status = 'available'
            ORDER BY i.created_at DESC
        ";
        return $this->db()->query($sql)->fetchAll();
    }

    public function existsAvailable(int $itemId): bool
    {
        $stmt = $this->db()->prepare("SELECT id FROM items WHERE id = ? AND status = 'available'");
        $stmt->execute([$itemId]);
        return (bool)$stmt->fetch();
    }
}
