<?php

namespace App\Controllers\Api;

use App\Models\CalculationModel;

class ProfitController extends BaseApiController
{
    protected CalculationModel $calcModel;

    public function __construct()
    {
        $this->calcModel = new CalculationModel();
    }

    public function calculate()
    {
        $request = $this->request;

        $json = $request->getJSON(true);
        $input = is_array($json) ? $json : $request->getPost();

        $rules = [
            'crop_name' => 'required|string|max_length[100]',
            'quantity_kg' => 'required|decimal|greater_than[0]',
            'production_cost_per_kg' => 'required|decimal|greater_than_equal_to[0]',
            'selling_price_per_kg' => 'required|decimal|greater_than_equal_to[0]',
        ];

        $messages = [
            'crop_name' => [
                'required' => 'Crop name is required.',
            ],
            'quantity_kg' => [
                'required'     => 'Quantity (kg) is required.',
                'decimal'      => 'Quantity must be a number.',
                'greater_than' => 'Quantity must be greater than 0.',
            ],
            'production_cost_per_kg' => [
                'required' => 'Production cost per kg is required.',
                'decimal'  => 'Production cost must be a number.',
            ],
            'selling_price_per_kg' => [
                'required' => 'Selling price per kg is required.',
                'decimal'  => 'Selling price must be a number.',
            ],
        ];

        $validation = \Config\Services::validation();
        $validation->setRules($rules, $messages);

        if (!$validation->run($input)) {
            return $this->fail('Validation failed.', 422, $validation->getErrors());
        }

        $cropName  = strip_tags(trim((string) $input['crop_name']));
        $quantity  = (float) $input['quantity_kg'];
        $prodCost  = (float) $input['production_cost_per_kg'];
        $sellPrice = (float) $input['selling_price_per_kg'];

        $revenue     = $quantity * $sellPrice;
        $totalCost   = $quantity * $prodCost;
        $netProfit   = $revenue - $totalCost;
        $marginPct   = $revenue > 0 ? round(($netProfit / $revenue) * 100, 2) : 0.0;
        $breakEven   = $quantity > 0 ? round($totalCost / $quantity, 2) : 0.0;
        $suggested   = round($breakEven * 1.2, 2);

        $result = [
            'crop_name'              => $cropName,
            'quantity_kg'            => $quantity,
            'production_cost_per_kg' => $prodCost,
            'selling_price_per_kg'   => $sellPrice,
            'revenue'                => round($revenue, 2),
            'total_cost'             => round($totalCost, 2),
            'net_profit'             => round($netProfit, 2),
            'is_profit'              => $netProfit >= 0,
            'profit_margin'          => $marginPct,
            'break_even_price'       => $breakEven,
            'suggested_price'        => $suggested,
        ];

        $this->calcModel->insert([
            'crop_name'              => $cropName,
            'quantity_kg'            => $quantity,
            'production_cost_per_kg' => $prodCost,
            'selling_price_per_kg'   => $sellPrice,
            'revenue'                => $result['revenue'],
            'total_cost'             => $result['total_cost'],
            'net_profit'             => $result['net_profit'],
            'profit_margin'          => $marginPct,
            'break_even_price'       => $breakEven,
            'suggested_price'        => $suggested,
            'ip_address'             => $request->getIPAddress(),
        ]);

        return $this->ok($result, 201);
    }

    public function history()
    {
        $limit = (int) ($this->request->getGet('limit') ?? 20);
        $limit = $limit > 0 && $limit <= 100 ? $limit : 20;

        return $this->ok($this->calcModel->recent($limit));
    }
}

