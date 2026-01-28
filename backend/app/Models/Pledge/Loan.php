<?php

namespace App\Models\Pledge;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Loan extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'pledge_id',
        'loan_no',
        'date',
        'amount',
        'balance_amount',
        'interest_percentage',
        'validity_months',
        'due_date',
        'payment_method',
        'processing_fee',
        'estimated_amount',
        'include_processing_fee',
        'interest_taken',
        'amount_to_be_given',
        'calculation_method',
        'metal_rate',
        'status'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'balance_amount' => 'decimal:2',
        'estimated_amount' => 'decimal:2',
        'amount_to_be_given' => 'decimal:2',
        'processing_fee' => 'decimal:2',
        'interest_percentage' => 'decimal:2',
        'metal_rate' => 'decimal:2',
        'include_processing_fee' => 'boolean',
        'interest_taken' => 'boolean',
        'date' => 'date',
        'due_date' => 'date',
    ];

    public function pledge()
    {
        return $this->belongsTo(Pledge::class);
    }

    public function media()
    {
        return $this->hasMany(MediaFile::class);
    }

    public function customer_loan_track()
    {
        return $this->hasOne(\App\Models\CustomerApp\CustomerLoanTrack::class);
    }

    public function payments()
    {
        return $this->hasMany(\App\Models\Pledge\LoanPayment::class);
    }

    public function extras()
    {
        return $this->hasMany(\App\Models\Pledge\LoanExtra::class);
    }
}
