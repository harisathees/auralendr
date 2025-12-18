<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'is_credit', 'is_debit', 'is_active'];

    protected $casts = [
        'is_credit' => 'boolean',
        'is_debit' => 'boolean',
        'is_active' => 'boolean',
    ];
}
