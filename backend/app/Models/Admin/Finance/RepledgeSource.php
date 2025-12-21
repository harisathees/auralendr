<?php

namespace App\Models\Admin\Finance;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

use App\Models\Admin\Organization\Branch\Branch;
use App\Models\Repledge\Repledge;

class RepledgeSource extends Model
{
    use HasFactory;

    protected $guarded = [];

    // Relationship to branches
    public function branches()
    {
        return $this->belongsToMany(Branch::class, 'branch_repledge_sources');
    }

    public function repledges()
    {
        return $this->hasMany(Repledge::class, 'repledge_source_id');
    }
}
