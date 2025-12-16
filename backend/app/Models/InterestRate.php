<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class InterestRate extends Model
{
    use HasFactory;

    protected $fillable = ['rate', 'estimation_percentage', 'jewel_type_id'];

    public function jewelType()
    {
        return $this->belongsTo(JewelType::class);
    }
}
