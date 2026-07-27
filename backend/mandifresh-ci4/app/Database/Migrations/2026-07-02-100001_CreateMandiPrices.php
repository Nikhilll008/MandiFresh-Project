<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateMandiPrices extends Migration
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
            'crop_id' => [
                'type'       => 'INT',
                'constraint' => 11,
                'unsigned'   => true,
            ],
            'mandi_name' => [
                'type'       => 'VARCHAR',
                'constraint' => 150,
            ],
            'price_date' => [
                'type' => 'DATE',
            ],
            'current_price' => [
                'type'       => 'DECIMAL',
                'constraint' => '10,2',
            ],
            'previous_price' => [
                'type'       => 'DECIMAL',
                'constraint' => '10,2',
                'default'    => 0,
            ],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey('crop_id');
        $this->forge->addKey('price_date');
        $this->forge->addKey('mandi_name');

        $this->forge->addForeignKey('crop_id', 'crops', 'id', 'CASCADE', 'CASCADE');

        $this->forge->createTable('mandi_prices', true);
    }

    public function down()
    {
        $this->forge->dropTable('mandi_prices', true);
    }
}
