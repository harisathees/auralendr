<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MoneySource extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type', // cash, bank, wallet
        'balance',
        'description',
        'is_outbound',
        'is_inbound',
        'is_active',
        'show_balance'
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'is_outbound' => 'boolean',
        'is_inbound' => 'boolean',
        'is_active' => 'boolean',
        'show_balance' => 'boolean'
    ];

    // Branch relationship if needed
    public function branches()
    {
        return $this->belongsToMany(BranchAndUser\Branch::class, 'branch_money_sources');
    }
}
