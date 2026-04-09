<?php

class Router
{
    private array $routes = ['GET' => [], 'POST' => []];

    public function get(string $path, array $handler): void
    {
        $this->routes['GET'][$path] = $handler;
    }

    public function post(string $path, array $handler): void
    {
        $this->routes['POST'][$path] = $handler;
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = parse_url($uri, PHP_URL_PATH);
        $base = rtrim(dirname($_SERVER['SCRIPT_NAME']), '/');
        if ($base && str_starts_with($path, $base)) {
            $path = substr($path, strlen($base));
        }
        $path = $path ?: '/';

        $handler = $this->routes[$method][$path] ?? null;

        header('Content-Type: application/json');

        if (!$handler) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Route not found']);
            return;
        }

        [$class, $action] = $handler;
        (new $class())->$action();
    }
}