<?php

namespace App\Models\Repledge;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class RepledgeBank extends Model
{
    use HasFactory;

    protected $guarded = [];

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

    public function repledges()
    {
        return $this->hasMany(Repledge::class, 'bank_id');
    }
}
