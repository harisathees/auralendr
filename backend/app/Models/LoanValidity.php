<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LoanValidity extends Model
{
    use HasFactory;

    protected $fillable = ['months', 'label', 'jewel_type_id'];

    public function jewelType()
    {
        return $this->belongsTo(JewelType::class);
    }
}
