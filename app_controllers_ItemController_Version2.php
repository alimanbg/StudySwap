<?php
require_once __DIR__ . '/../models/Item.php';

class ItemController
{
    private Item $items;

    public function __construct()
    {
        $this->items = new Item();
        if (session_status() === PHP_SESSION_NONE) session_start();
    }

    public function list(): void
    {
        echo json_encode(['success' => true, 'data' => $this->items->allAvailable()]);
    }

    public function create(): void
    {
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $title = trim($data['title'] ?? '');
        $category = trim($data['category'] ?? '');
        $description = trim($data['description'] ?? '');

        if ($title === '' || $category === '') {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'title and category are required']);
            return;
        }

        $ok = $this->items->create((int)$_SESSION['user']['id'], $title, $category, $description);

        echo json_encode([
            'success' => $ok,
            'message' => $ok ? 'Item created' : 'Failed to create item'
        ]);
    }
}