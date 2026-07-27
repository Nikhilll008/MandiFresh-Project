<?php

namespace App\Models;

use CodeIgniter\Model;

class PriceModel extends Model
{
    protected $table            = 'mandi_prices';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;

    protected $allowedFields = [
        'crop_id', 'mandi_name', 'price_date', 'current_price', 'previous_price',
    ];

    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    protected $validationRules = [
        'crop_id'        => 'required|is_natural_no_zero',
        'mandi_name'     => 'required|max_length[150]',
        'price_date'     => 'required|valid_date[Y-m-d]',
        'current_price'  => 'required|decimal|greater_than[0]',
        'previous_price' => 'permit_empty|decimal|greater_than_equal_to[0]',
    ];

    protected function baseQuery()
    {
        return $this->select('mandi_prices.id, mandi_prices.crop_id, crops.name as crop, crops.unit,
                               mandi_prices.mandi_name as mandi, mandi_prices.price_date as date,
                               mandi_prices.current_price as current, mandi_prices.previous_price as previous')
                    ->join('crops', 'crops.id = mandi_prices.crop_id');
    }

    protected function applyFilters($builder, array $filters)
    {
        if (!empty($filters['crop'])) {
            $builder->where('crops.name', $filters['crop']);
        }
        if (!empty($filters['crop_id'])) {
            $builder->where('mandi_prices.crop_id', $filters['crop_id']);
        }
        if (!empty($filters['mandi'])) {
            $builder->like('mandi_prices.mandi_name', $filters['mandi']);
        }
        if (!empty($filters['date'])) {
            $builder->where('mandi_prices.price_date', $filters['date']);
        }
        if (!empty($filters['search'])) {
            $builder->groupStart()
                    ->like('crops.name', $filters['search'])
                    ->orLike('mandi_prices.mandi_name', $filters['search'])
                    ->groupEnd();
        }
        return $builder;
    }

    public function filtered(array $filters, int $page = 1, int $perPage = 10): array
    {
        $page    = max(1, $page);
        $perPage = min(100, max(1, $perPage));

        $builder = $this->applyFilters($this->baseQuery(), $filters);
        $total   = $builder->countAllResults(false);

        $rows = $builder->orderBy('mandi_prices.price_date', 'DESC')
                         ->orderBy('crops.name', 'ASC')
                         ->limit($perPage, ($page - 1) * $perPage)
                         ->get()
                         ->getResultArray();

        return [
            'data' => $rows,
            'pagination' => [
                'page'        => $page,
                'per_page'    => $perPage,
                'total'       => $total,
                'total_pages' => (int) ceil($total / $perPage),
            ],
        ];
    }

    public function summary(array $filters): array
    {
        $builder = $this->db->table('mandi_prices')
                             ->join('crops', 'crops.id = mandi_prices.crop_id')
                             ->selectMax('mandi_prices.current_price', 'highest')
                             ->selectMin('mandi_prices.current_price', 'lowest')
                             ->selectAvg('mandi_prices.current_price', 'average')
                             ->selectCount('mandi_prices.id', 'total');

        $builder = $this->applyFilters($builder, $filters);
        $row = $builder->get()->getRowArray();

        return [
            'highest' => $row['highest'] !== null ? round((float) $row['highest'], 2) : 0,
            'lowest'  => $row['lowest']  !== null ? round((float) $row['lowest'], 2)  : 0,
            'average' => $row['average'] !== null ? round((float) $row['average'], 2) : 0,
            'total'   => (int) $row['total'],
        ];
    }

    public function trend(int $cropId, int $days = 30): array
    {
        $from = date('Y-m-d', strtotime("-{$days} days"));

        return $this->db->table('mandi_prices')
                         ->select('price_date as date')
                         ->selectAvg('current_price', 'avg_price')
                         ->where('crop_id', $cropId)
                         ->where('price_date >=', $from)
                         ->groupBy('price_date')
                         ->orderBy('price_date', 'ASC')
                         ->get()
                         ->getResultArray();
    }

    public function historyForCrop(int $cropId, int $days = 30, int $limit = 200): array
    {
        $from = date('Y-m-d', strtotime("-{$days} days"));

        return $this->baseQuery()
                    ->where('mandi_prices.crop_id', $cropId)
                    ->where('mandi_prices.price_date >=', $from)
                    ->orderBy('mandi_prices.price_date', 'DESC')
                    ->limit($limit)
                    ->get()
                    ->getResultArray();
    }

    public function latestForCrop(int $cropId): array
    {
        return $this->baseQuery()
                    ->where('mandi_prices.crop_id', $cropId)
                    ->orderBy('mandi_prices.price_date', 'DESC')
                    ->get()
                    ->getResultArray();
    }

    public function distinctMandis(): array
    {
        return $this->distinct()
                    ->select('mandi_name')
                    ->orderBy('mandi_name', 'ASC')
                    ->findColumn('mandi_name') ?? [];
    }

    public function dashboardStats(): array
    {
        $overall = $this->db->table('mandi_prices')
                             ->selectMax('current_price', 'highest')
                             ->selectMin('current_price', 'lowest')
                             ->selectAvg('current_price', 'average')
                             ->selectCount('id', 'total')
                             ->get()
                             ->getRowArray();

        $last30 = $this->db->table('mandi_prices')
                            ->selectCount('id', 'total')
                            ->where('price_date >=', date('Y-m-d', strtotime('-30 days')))
                            ->get()
                            ->getRowArray();

        return [
            'highest_price'      => $overall['highest'] !== null ? round((float) $overall['highest'], 2) : 0,
            'lowest_price'       => $overall['lowest']  !== null ? round((float) $overall['lowest'], 2)  : 0,
            'average_price'      => $overall['average'] !== null ? round((float) $overall['average'], 2) : 0,
            'total_records'      => (int) $overall['total'],
            'records_last_30_days' => (int) $last30['total'],
        ];
    }

    public function topMovers(string $direction = 'up', int $limit = 5): array
    {
        $builder = $this->baseQuery()
            ->where('mandi_prices.previous_price >', 0);

        $rows = $builder->get()->getResultArray();

        foreach ($rows as &$row) {
            $row['change_pct'] = $row['previous'] > 0
                ? round((($row['current'] - $row['previous']) / $row['previous']) * 100, 2)
                : 0;
        }
        unset($row);

        usort($rows, function ($a, $b) use ($direction) {
            return $direction === 'up'
                ? $b['change_pct'] <=> $a['change_pct']
                : $a['change_pct'] <=> $b['change_pct'];
        });

        return array_slice($rows, 0, $limit);
    }
}

