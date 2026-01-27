<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use App\Models\Pledge\Pledge;
use App\Models\Admin\Organization\User\User;

class PendingApproval extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'pledge_id',
        'requested_by',
        'reviewed_by',
        'loan_amount',
        'estimated_amount',
        'status',
        'rejection_reason'
    ];

    public function pledge()
    {
        return $this->belongsTo(Pledge::class);
    }

    public function requestedBy()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function reviewedBy()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
