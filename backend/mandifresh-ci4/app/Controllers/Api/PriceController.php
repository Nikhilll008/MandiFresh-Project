<?php

namespace App\Controllers\Api;

use App\Models\CropModel;
use App\Models\PriceModel;

class PriceController extends BaseApiController
{
    protected CropModel $cropModel;
    protected PriceModel $priceModel;

    public function __construct()
    {
        $this->cropModel  = new CropModel();
        $this->priceModel = new PriceModel();
    }

    public function index()
    {
        $request = $this->request;

        $filters = [
            'crop'   => trim((string) ($request->getGet('crop')   ?? '')),
            'mandi'  => trim((string) ($request->getGet('mandi')  ?? '')),
            'date'   => trim((string) ($request->getGet('date')   ?? '')),
            'search' => trim((string) ($request->getGet('search') ?? '')),
        ];
        $filters = array_map(fn ($v) => strip_tags($v), $filters);

        if ($filters['date'] !== '' && !$this->isValidDate($filters['date'])) {
            return $this->fail('Invalid date format. Use YYYY-MM-DD.', 422);
        }

        $page    = (int) ($request->getGet('page') ?? 1);
        $perPage = (int) ($request->getGet('per_page') ?? 10);
        $page    = $page > 0 ? $page : 1;
        $perPage = $perPage > 0 ? $perPage : 10;

        $result  = $this->priceModel->filtered($filters, $page, $perPage);
        $summary = $this->priceModel->summary($filters);

        return $this->ok($result['data'], 200, [
            'filters'    => $filters,
            'summary'    => $summary,
            'pagination' => $result['pagination'],
        ]);
    }

    public function byCrop($id = null)
    {
        $crop = $this->validateCropId($id);
        if ($crop === null) {
            return $this->notFound('Crop not found.');
        }

        $rows = $this->priceModel->latestForCrop((int) $id);

        return $this->ok($rows, 200, ['crop' => $crop]);
    }

    public function chart($id = null)
    {
        $crop = $this->validateCropId($id);
        if ($crop === null) {
            return $this->notFound('Crop not found.');
        }

        $days = (int) ($this->request->getGet('days') ?? 30);
        $days = $days > 0 && $days <= 90 ? $days : 30;

        $rows = $this->priceModel->trend((int) $id, $days);

        $labels = array_map(fn ($r) => $r['date'], $rows);
        $data   = array_map(fn ($r) => round((float) $r['avg_price'], 2), $rows);

        return $this->ok([
            'labels' => $labels,
            'prices' => $data,
        ], 200, [
            'crop' => $crop['name'],
            'days' => $days,
        ]);
    }

    public function history($id = null)
    {
        $crop = $this->validateCropId($id);
        if ($crop === null) {
            return $this->notFound('Crop not found.');
        }

        $days = (int) ($this->request->getGet('days') ?? 30);
        $days = $days > 0 && $days <= 90 ? $days : 30;

        $rows = $this->priceModel->historyForCrop((int) $id, $days);

        return $this->ok($rows, 200, ['crop' => $crop['name'], 'days' => $days]);
    }

    public function crops()
    {
        return $this->ok($this->cropModel->getActiveCrops());
    }

    public function mandis()
    {
        return $this->ok($this->priceModel->distinctMandis());
    }

    private function validateCropId($id): ?array
    {
        if ($id === null || !ctype_digit((string) $id)) {
            return null;
        }
        return $this->cropModel->find((int) $id);
    }

    private function isValidDate(string $date): bool
    {
        $d = \DateTime::createFromFormat('Y-m-d', $date);
        return $d && $d->format('Y-m-d') === $date;
    }
}

