<?php

namespace App\Models\Repledge;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class RepledgeSource extends Model
{
    use HasFactory;

    protected $guarded = [];

    // Relationship to branches
    public function branches()
    {
        return $this->belongsToMany(\App\Models\BranchAndUser\Branch::class, 'branch_repledge_sources');
    }

    public function repledges()
    {
        return $this->hasMany(Repledge::class, 'repledge_source_id');
    }
}
