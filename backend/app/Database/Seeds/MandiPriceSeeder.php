<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class MandiPriceSeeder extends Seeder
{
    protected array $mandis = [
        'Lasalgaon Mandi, Nashik',
        'Azadpur Mandi, Delhi',
        'Vashi APMC, Navi Mumbai',
        'Pune Market Yard',
        'Indore Mandi, MP',
        'Ludhiana Grain Market',
        'Nizamabad Mandi, Telangana',
        'Coimbatore Mandi, TN',
        'Solapur APMC',
        'Kolar Mandi, Karnataka',
    ];

    protected array $basePrices = [
        'Onion'           => 1850,
        'Tomato'          => 2200,
        'Potato'          => 1400,
        'Wheat'           => 2350,
        'Rice (Basmati)'  => 4200,
        'Soybean'         => 4650,
        'Cotton'          => 7200,
        'Maize'           => 2050,
        'Turmeric'        => 14500,
        'Chana (Gram)'    => 5300,
        'Groundnut'       => 6100,
        'Mustard Seed'    => 5450,
        'Green Chilli'    => 3800,
        'Sugarcane'       => 340,
        'Banana'          => 1200,
    ];

    public function run()
    {
        mt_srand(19822);

        $crops = $this->db->table('crops')->select('id, name')->get()->getResultArray();
        if (empty($crops)) {
            echo "No crops found — run CropSeeder first.\n";
            return;
        }

        $this->db->table('mandi_prices')->truncate();

        $days  = 30;
        $today = new \DateTime('2026-06-30');
        $rows  = [];
        $now   = date('Y-m-d H:i:s');

        foreach ($crops as $crop) {
            $base = $this->basePrices[$crop['name']] ?? 2000;

            $mandiCount = 3 + (crc32($crop['name']) % 2);
            $cropMandis = $this->pickMandis($crop['name'], $mandiCount);

            foreach ($cropMandis as $mandi) {
                $value = $base * (0.92 + $this->rand01() * 0.08);

                for ($d = $days; $d >= 0; $d--) {
                    $date = (clone $today)->modify("-{$d} days")->format('Y-m-d');

                    $noise      = ($this->rand01() - 0.5) * 0.035;
                    $trendPull  = ($base - $value) * 0.03;
                    $value      = max(1, $value * (1 + $noise) + $trendPull);
                    $current    = round($value, 2);
                    $previous   = round($value / (1 + (($this->rand01() - 0.5) * 0.05)), 2);

                    $rows[] = [
                        'crop_id'        => $crop['id'],
                        'mandi_name'     => $mandi,
                        'price_date'     => $date,
                        'current_price'  => $current,
                        'previous_price' => $previous,
                        'created_at'     => $now,
                        'updated_at'     => $now,
                    ];
                }
            }

            $this->db->table('mandi_prices')->insertBatch($rows);
            $rows = [];
        }

        $total = $this->db->table('mandi_prices')->countAllResults();
        echo "Seeded {$total} mandi_prices rows across " . count($crops) . " crops.\n";
    }

    protected function pickMandis(string $seedKey, int $count): array
    {
        $offset = crc32($seedKey) % count($this->mandis);
        $ordered = array_merge(
            array_slice($this->mandis, $offset),
            array_slice($this->mandis, 0, $offset)
        );
        return array_slice($ordered, 0, $count);
    }

    protected function rand01(): float
    {
        return mt_rand() / mt_getrandmax();
    }
}

