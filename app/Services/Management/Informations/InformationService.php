<?php

namespace App\Services\Management\Informations;

use App\Models\Information;
use App\Repositories\Contracts\InformationRepositoryInterface;
use Illuminate\Support\Facades\DB;

class InformationService
{
    public function __construct(
        private readonly InformationRepositoryInterface $informations,
    ) {}

    public function create(array $data): Information
    {
        return DB::transaction(function () use ($data): Information {
            return $this->informations->create([
                'title' => $data['title'],
                'content' => $data['content'],
                'status' => $data['status'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
            ]);
        });
    }

    public function update(Information $information, array $data): Information
    {
        return DB::transaction(function () use ($information, $data): Information {
            $information->title = $data['title'];
            $information->content = $data['content'];
            $information->status = $data['status'];
            $information->start_date = $data['start_date'];
            $information->end_date = $data['end_date'];

            $this->informations->save($information);

            return $information;
        });
    }

    public function delete(Information $information): void
    {
        DB::transaction(function () use ($information): void {
            $this->informations->delete($information);
        });
    }

    /**
     * @param  list<string>  $ids
     * @return int|null Jumlah yang dihapus, atau null jika tidak ada ID
     */
    public function bulkDestroy(array $ids): ?int
    {
        if ($ids === []) {
            return null;
        }

        DB::transaction(function () use ($ids): void {
            $this->informations->deleteWhereIdsIn($ids);
        });

        return \count($ids);
    }
}
