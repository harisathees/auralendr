<?php

namespace App\Models\Admin\Finance;

use Illuminate\Database\Eloquent\Model;

class CapitalSource extends Model
{
    protected $guarded = [];

    protected $appends = ['total_invested'];

    public function transactions()
    {
        return $this->morphMany(\App\Models\Transaction\Transaction::class, 'transactionable');
    }

    public function getTotalInvestedAttribute()
    {
        $credits = $this->transactions()->where('type', 'credit')->sum('amount');
        $debits = $this->transactions()->where('type', 'debit')->sum('amount');
        return $credits - $debits;
    }
}
