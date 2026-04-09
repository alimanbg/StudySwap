<?php
session_start();

require_once __DIR__ . '/../app/core/Router.php';
require_once __DIR__ . '/../app/controllers/AuthController.php';
require_once __DIR__ . '/../app/controllers/ItemController.php';
require_once __DIR__ . '/../app/controllers/RequestController.php';

$router = new Router();

// Health
$router->get('/', [ItemController::class, 'list']);

// Auth
$router->post('/api/register', [AuthController::class, 'register']);
$router->post('/api/login', [AuthController::class, 'login']);
$router->post('/api/logout', [AuthController::class, 'logout']);
$router->get('/api/me', [AuthController::class, 'me']);

// Items
$router->get('/api/items', [ItemController::class, 'list']);
$router->post('/api/items', [ItemController::class, 'create']);

// Requests
$router->post('/api/requests', [RequestController::class, 'create']);
$router->get('/api/requests/mine', [RequestController::class, 'mine']);
$router->get('/api/admin/requests', [RequestController::class, 'all']);
$router->post('/api/admin/requests/status', [RequestController::class, 'updateStatus']);

$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
