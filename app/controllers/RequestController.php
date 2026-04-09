<?php
require_once __DIR__ . '/../models/SwapRequest.php';
require_once __DIR__ . '/../models/Item.php';

class RequestController
{
    private SwapRequest $requests;
    private Item $items;

    public function __construct()
    {
        $this->requests = new SwapRequest();
        $this->items = new Item();
        if (session_status() === PHP_SESSION_NONE) session_start();
    }

    public function create(): void
    {
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $itemId = (int)($data['item_id'] ?? 0);
        $message = trim($data['message'] ?? '');

        if ($itemId <= 0) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'Valid item_id is required']);
            return;
        }

        if (!$this->items->existsAvailable($itemId)) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Item not found or unavailable']);
            return;
        }

        $ok = $this->requests->create((int)$_SESSION['user']['id'], $itemId, $message);
        echo json_encode(['success' => $ok, 'message' => $ok ? 'Request submitted' : 'Failed to submit request']);
    }

    public function mine(): void
    {
        if (!isset($_SESSION['user'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'message' => 'Unauthorized']);
            return;
        }

        $rows = $this->requests->byRequester((int)$_SESSION['user']['id']);
        echo json_encode(['success' => true, 'data' => $rows]);
    }

    public function all(): void
    {
        if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden']);
            return;
        }

        echo json_encode(['success' => true, 'data' => $this->requests->allForAdmin()]);
    }

    public function updateStatus(): void
    {
        if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Forbidden']);
            return;
        }

        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        $id = (int)($data['id'] ?? 0);
        $status = $data['status'] ?? '';

        if ($id <= 0 || !in_array($status, ['approved', 'rejected'], true)) {
            http_response_code(422);
            echo json_encode(['success' => false, 'message' => 'id and status(approved/rejected) are required']);
            return;
        }

        $ok = $this->requests->updateStatus($id, $status);
        echo json_encode(['success' => $ok, 'message' => $ok ? 'Status updated' : 'Failed to update status']);
    }
}
