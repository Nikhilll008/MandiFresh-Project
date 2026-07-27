<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateProfitCalculations extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'crop_name' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
            ],
            'quantity_kg' => [
                'type'       => 'DECIMAL',
                'constraint' => '12,2',
            ],
            'production_cost_per_kg' => [
                'type'       => 'DECIMAL',
                'constraint' => '10,2',
            ],
            'selling_price_per_kg' => [
                'type'       => 'DECIMAL',
                'constraint' => '10,2',
            ],
            'revenue' => [
                'type'       => 'DECIMAL',
                'constraint' => '14,2',
            ],
            'total_cost' => [
                'type'       => 'DECIMAL',
                'constraint' => '14,2',
            ],
            'net_profit' => [
                'type'       => 'DECIMAL',
                'constraint' => '14,2',
                'comment'    => 'negative value indicates a net loss',
            ],
            'profit_margin' => [
                'type'       => 'DECIMAL',
                'constraint' => '6,2',
                'comment'    => 'percentage',
            ],
            'break_even_price' => [
                'type'       => 'DECIMAL',
                'constraint' => '10,2',
            ],
            'suggested_price' => [
                'type'       => 'DECIMAL',
                'constraint' => '10,2',
            ],
            'ip_address' => [
                'type'       => 'VARCHAR',
                'constraint' => 45,
                'null'       => true,
            ],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey('created_at');
        $this->forge->createTable('profit_calculations', true);
    }

    public function down()
    {
        $this->forge->dropTable('profit_calculations', true);
    }
}
