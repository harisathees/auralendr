<?php

namespace App\Models\Pledge;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Jewel extends Model
{
    use HasFactory;

    protected $fillable = [
        'pledge_id','jewel_type','quality','description',
        'pieces','weight','stone_weight','net_weight','faults'
    ];

    public function pledge()
    {
        return $this->belongsTo(Pledge::class);
    }

    public function media()
    {
        return $this->hasMany(MediaFile::class);
    }
}
