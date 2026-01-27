<?php

namespace App\Models\pledge;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
// @phpstan-ignore-next-line
class Pledge extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'customer_id',
        'branch_id',
        'created_by',
        'updated_by',
        'status',
        'reference_no',
        'approval_status'
    ];

    public function pendingApproval()
    {
        return $this->hasOne(\App\Models\PendingApproval::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }
// @phpstan-ignore-next-line
    public function loan()
    {
        return $this->hasOne(Loan::class);
    }

    public function jewels()
    {
        return $this->hasMany(Jewel::class);
    }

    public function media()
    {
        return $this->hasMany(MediaFile::class);
    }

    public function branch()
    {
        return $this->belongsTo(\App\Models\Admin\Organization\Branch\Branch::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\Admin\Organization\User\User::class, 'created_by');
    }

    public function closure()
    {
        return $this->hasOne(PledgeClosure::class);
    }
}
