<?php

namespace App\Models\Repledge;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Admin\Organization\User\User;

class RepledgeClosure extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'repledge_id',
        'created_by',
        'closed_date',
        'principal_amount',
        'interest_paid',
        'total_paid_amount',
        'remarks',
        'status',
    ];

    protected $casts = [
        'closed_date' => 'date',
        'principal_amount' => 'float',
        'interest_paid' => 'float',
        'total_paid_amount' => 'float',
    ];

    public function repledge()
    {
        return $this->belongsTo(Repledge::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
