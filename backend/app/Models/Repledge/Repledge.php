<?php

namespace App\Models\Repledge;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;
use App\Models\Pledge\Loan;
use App\Models\Admin\Finance\RepledgeSource;

class Repledge extends Model
{
    use HasFactory, HasUlids;

    protected $guarded = [];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'due_date' => 'date',
    ];

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::addGlobalScope('branch', function (Builder $builder) {
            if (auth()->check() && auth()->user()->branch_id) {
                $builder->where('branch_id', auth()->user()->branch_id);
            }
        });

        static::creating(function ($model) {
            if (auth()->check() && auth()->user()->branch_id) {
                $model->branch_id = auth()->user()->branch_id;
            }
        });
    }

    public function source()
    {
        return $this->belongsTo(RepledgeSource::class, 'repledge_source_id');
    }

    public function loan()
    {
        return $this->belongsTo(Loan::class, 'loan_id');
    }
}
