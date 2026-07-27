<?php

namespace App\Models;

use CodeIgniter\Model;

class CropModel extends Model
{
    protected $table            = 'crops';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;

    protected $allowedFields = ['name', 'category', 'unit', 'is_active'];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $validationRules = [
        'name'     => 'required|min_length[2]|max_length[100]|is_unique[crops.name,id,{id}]',
        'category' => 'permit_empty|max_length[50]',
        'unit'     => 'permit_empty|max_length[20]',
        'is_active'=> 'permit_empty|in_list[0,1]',
    ];

    protected $validationMessages = [
        'name' => [
            'required'  => 'Crop name is required.',
            'is_unique' => 'A crop with this name already exists.',
        ],
    ];

    protected $skipValidation = false;

    public function getActiveCrops(): array
    {
        return $this->where('is_active', 1)
                    ->orderBy('name', 'ASC')
                    ->findAll();
    }

    public function findByName(string $name): ?array
    {
        return $this->where('name', $name)->first();
    }
}

