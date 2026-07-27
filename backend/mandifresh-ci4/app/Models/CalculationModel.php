<?php

namespace App\Models;

use CodeIgniter\Model;

class CalculationModel extends Model
{
    protected $table            = 'profit_calculations';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;

    protected $allowedFields = [
        'crop_name', 'quantity_kg', 'production_cost_per_kg', 'selling_price_per_kg',
        'revenue', 'total_cost', 'net_profit', 'profit_margin',
        'break_even_price', 'suggested_price', 'ip_address',
    ];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = '';

    protected $validationRules = [
        'crop_name'              => 'required|max_length[100]',
        'quantity_kg'             => 'required|decimal|greater_than[0]',
        'production_cost_per_kg'  => 'required|decimal|greater_than_equal_to[0]',
        'selling_price_per_kg'    => 'required|decimal|greater_than_equal_to[0]',
    ];

    public function recent(int $limit = 20): array
    {
        return $this->orderBy('created_at', 'DESC')
                    ->limit($limit)
                    ->findAll();
    }
}

