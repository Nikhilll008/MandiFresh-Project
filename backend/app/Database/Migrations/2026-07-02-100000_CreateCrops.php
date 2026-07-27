<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateCrops extends Migration
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
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => 100,
            ],
            'category' => [
                'type'       => 'VARCHAR',
                'constraint' => 50,
                'null'       => true,
                'comment'    => 'e.g. vegetable, grain, cash-crop, spice',
            ],
            'unit' => [
                'type'       => 'VARCHAR',
                'constraint' => 20,
                'default'    => 'quintal',
                'comment'    => 'unit prices are quoted in, e.g. quintal, kg',
            ],
            'is_active' => [
                'type'       => 'TINYINT',
                'constraint' => 1,
                'default'    => 1,
            ],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('name');
        $this->forge->createTable('crops', true);
    }

    public function down()
    {
        $this->forge->dropTable('crops', true);
    }
}
