<?php

namespace App\Models\CustomerApp;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Pledge\Loan;

class CustomerLoanStatusLog extends Model
{
    use HasFactory;

    public $timestamps = false; // Only created_at exists, handling manually or via default

    protected $fillable = [
        'loan_id',
        'status_code',
        'message',
        'created_at' // Allow manual setting if needed, but DB defaults strictly
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }
}
