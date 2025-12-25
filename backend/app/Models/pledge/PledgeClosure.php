<?php

namespace App\Models\Pledge;

use Illuminate\Database\Eloquent\Model;

class PledgeClosure extends Model
{
    protected $fillable = [
        'pledge_id',
        'created_by',
        'closed_date',
        'calculation_method',
        'balance_amount',
        'reduction_amount',
        'calculated_interest',
        'interest_reduction',
        'additional_reduction',
        'total_payable',
        'duration_str',
        'interest_rate_snapshot',
        'status',
        'metal_rate',
    ];

    public function pledge()
    {
        return $this->belongsTo(Pledge::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\Admin\Organization\User\User::class, 'created_by');
    }
}
