<?php

namespace App\Models\Pledge;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class LoanExtra extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'loan_id',
        'extra_amount',
        'disbursement_date',
        'payment_method',
        'notes',
        'created_by'
    ];

    protected $casts = [
        'disbursement_date' => 'date',
        'extra_amount' => 'decimal:2',
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
