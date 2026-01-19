<?php

namespace App\Models\Transaction;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;
    use \Illuminate\Database\Eloquent\Concerns\HasUlids;

    protected $guarded = [];

    protected $casts = [
        'date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function moneySource()
    {
        return $this->belongsTo(\App\Models\Admin\MoneySource\MoneySource::class);
    }

    public function transactionable()
    {
        return $this->morphTo();
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\Admin\Organization\User\User::class, 'created_by');
    }
}
