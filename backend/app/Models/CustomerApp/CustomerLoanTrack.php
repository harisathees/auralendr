<?php

namespace App\Models\CustomerApp;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use App\Models\Pledge\Loan;
use App\Models\Admin\Organization\Branch\Branch;

class CustomerLoanTrack extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'loan_id',
        'branch_id',
        'tracking_code',
    ];

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
