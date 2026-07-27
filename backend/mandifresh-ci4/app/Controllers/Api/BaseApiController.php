<?php

namespace App\Controllers\Api;

use CodeIgniter\Controller;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * BaseApiController
 *
 * Every API controller extends this so responses share one consistent
 * JSON envelope: { "status": "success"|"error", "data"|"errors": ... }
 */
class BaseApiController extends Controller
{
    protected function ok($data = [], int $code = 200, array $meta = [])
    {
        $payload = array_merge(['status' => 'success'], $meta, ['data' => $data]);
        return $this->response->setStatusCode($code)->setJSON($payload);
    }

    protected function fail(string $message, int $code = 400, $errors = null)
    {
        $payload = ['status' => 'error', 'message' => $message];
        if ($errors !== null) {
            $payload['errors'] = $errors;
        }
        return $this->response->setStatusCode($code)->setJSON($payload);
    }

    protected function notFound(string $message = 'Resource not found')
    {
        return $this->fail($message, 404);
    }
}
