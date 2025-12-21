<?php

namespace App\Models\Admin\JewelManagement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Admin\Finance\MetalRate;
use App\Models\Admin\LoanConfiguration\LoanValidity;

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
