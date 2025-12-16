<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JewelType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'is_active',
    ];

    public function metalRate()
    {
        return $this->hasOne(MetalRate::class);
    }

    public function validities()
    {
        return $this->hasMany(LoanValidity::class);
    }
}
