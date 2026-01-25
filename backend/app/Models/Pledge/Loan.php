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
        'interest_percentage',
        'validity_months',
        'due_date',
        'payment_method',
        'processing_fee',
        'estimated_amount',
        'include_processing_fee',
        'interest_taken',
        'amount_to_be_given',
        'metal_rate',
        'status'
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
}
