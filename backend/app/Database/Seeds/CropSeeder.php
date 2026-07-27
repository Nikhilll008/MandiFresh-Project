<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class CropSeeder extends Seeder
{
    public function run()
    {
        $crops = [
            ['name' => 'Onion',           'category' => 'vegetable', 'unit' => 'quintal'],
            ['name' => 'Tomato',          'category' => 'vegetable', 'unit' => 'quintal'],
            ['name' => 'Potato',          'category' => 'vegetable', 'unit' => 'quintal'],
            ['name' => 'Wheat',           'category' => 'grain',     'unit' => 'quintal'],
            ['name' => 'Rice (Basmati)',  'category' => 'grain',     'unit' => 'quintal'],
            ['name' => 'Soybean',         'category' => 'oilseed',   'unit' => 'quintal'],
            ['name' => 'Cotton',          'category' => 'cash-crop', 'unit' => 'quintal'],
            ['name' => 'Maize',           'category' => 'grain',     'unit' => 'quintal'],
            ['name' => 'Turmeric',        'category' => 'spice',     'unit' => 'quintal'],
            ['name' => 'Chana (Gram)',    'category' => 'pulse',     'unit' => 'quintal'],
            ['name' => 'Groundnut',       'category' => 'oilseed',   'unit' => 'quintal'],
            ['name' => 'Mustard Seed',    'category' => 'oilseed',   'unit' => 'quintal'],
            ['name' => 'Green Chilli',    'category' => 'vegetable', 'unit' => 'quintal'],
            ['name' => 'Sugarcane',       'category' => 'cash-crop', 'unit' => 'quintal'],
            ['name' => 'Banana',          'category' => 'fruit',     'unit' => 'quintal'],
        ];

        $now = date('Y-m-d H:i:s');
        foreach ($crops as &$crop) {
            $crop['is_active']  = 1;
            $crop['created_at'] = $now;
            $crop['updated_at'] = $now;
        }
        unset($crop);

        $this->db->table('crops')->truncate();
        $this->db->table('crops')->insertBatch($crops);
    }
}

