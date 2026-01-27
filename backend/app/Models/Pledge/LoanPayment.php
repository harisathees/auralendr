<?php

namespace App\Models\Pledge;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LoanPayment extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'loan_id',
        'total_paid_amount',
        'principal_amount',
        'interest_amount',
        'payment_date',
        'payment_method',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'payment_date' => 'date',
        'total_paid_amount' => 'decimal:2',
        'principal_amount' => 'decimal:2',
        'interest_amount' => 'decimal:2',
    ];

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\Admin\Organization\User\User::class, 'created_by');
    }
}
