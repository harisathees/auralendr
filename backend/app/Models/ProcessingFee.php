<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcessingFee extends Model
{
    use HasFactory;

    protected $fillable = [
        'jewel_type_id',
        'branch_id',
        'percentage',
        'max_amount',
    ];

    public function jewelType()
    {
        return $this->belongsTo(JewelType::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
