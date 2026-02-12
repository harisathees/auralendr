<?php

namespace App\Models\Staff;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class CashReconciliation extends Model
{
    use HasFactory, HasUlids;

    protected $guarded = [];

    protected $casts = [
        'date' => 'date',
        'system_expected_amount' => 'decimal:2',
        'physical_amount' => 'decimal:2',
        'difference' => 'decimal:2',
        'denominations' => 'array',
    ];

    public function branch()
    {
        return $this->belongsTo(\App\Models\Admin\Organization\Branch\Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\Admin\Organization\User\User::class);
    }
}
