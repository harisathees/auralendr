<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $guarded = [];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function moneySource()
    {
        return $this->belongsTo(\App\Models\MoneySource::class);
    }

    public function transactionable()
    {
        return $this->morphTo();
    }
}
