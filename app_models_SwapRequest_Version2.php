<?php
require_once __DIR__ . '/../core/Model.php';

class SwapRequest extends Model
{
    public function create(int $requesterId, int $itemId, string $message): bool
    {
        $stmt = $this->db()->prepare("
            INSERT INTO swap_requests (requester_id, item_id, message, status)
            VALUES (?, ?, ?, 'pending')
        ");
        return $stmt->execute([$requesterId, $itemId, $message]);
    }

    public function byRequester(int $requesterId): array
    {
        $stmt = $this->db()->prepare("
            SELECT sr.id, sr.message, sr.status, sr.created_at,
                   i.title AS item_title, i.category AS item_category
            FROM swap_requests sr
            JOIN items i ON i.id = sr.item_id
            WHERE sr.requester_id = ?
            ORDER BY sr.created_at DESC
        ");
        $stmt->execute([$requesterId]);
        return $stmt->fetchAll();
    }

    public function allForAdmin(): array
    {
        $sql = "
            SELECT sr.id, sr.message, sr.status, sr.created_at,
                   r.full_name AS requester_name, r.email AS requester_email,
                   i.title AS item_title, i.category AS item_category
            FROM swap_requests sr
            JOIN users r ON r.id = sr.requester_id
            JOIN items i ON i.id = sr.item_id
            ORDER BY sr.created_at DESC
        ";
        return $this->db()->query($sql)->fetchAll();
    }

    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->db()->prepare("UPDATE swap_requests SET status = ? WHERE id = ?");
        return $stmt->execute([$status, $id]);
    }
}