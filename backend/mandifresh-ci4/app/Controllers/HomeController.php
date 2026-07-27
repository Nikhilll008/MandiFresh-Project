<?php

namespace App\Controllers\Api;

use App\Models\CropModel;
use App\Models\PriceModel;
use App\Models\CalculationModel;


class HomeController extends BaseApiController
{
    protected CropModel $cropModel;
    protected PriceModel $priceModel;
    protected CalculationModel $calcModel;

    public function __construct()
    {
        $this->cropModel = new CropModel();
        $this->priceModel = new PriceModel();
        $this->calcModel = new CalculationModel();
    }

    public function dashboard()
    {
        $stats = $this->priceModel->dashboardStats();

        $data = [
            'total_crops'           => $this->cropModel->where('is_active', 1)->countAllResults(),
            'total_mandis'          => count($this->priceModel->distinctMandis()),
            'total_records'         => $stats['total_records'],
            'records_last_30_days'  => $stats['records_last_30_days'],
            'highest_price'         => $stats['highest_price'],
            'lowest_price'          => $stats['lowest_price'],
            'average_price'         => $stats['average_price'],
            'total_calculations'    => $this->calcModel->countAllResults(),
            'top_gainers'           => $this->priceModel->topMovers('up', 5),
            'top_losers'            => $this->priceModel->topMovers('down', 5),
            'generated_at'          => date('Y-m-d H:i:s'),
        ];

        return $this->ok($data);
    }
}
