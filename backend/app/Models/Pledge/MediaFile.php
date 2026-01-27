<?php

namespace App\Models\Pledge;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Storage;

class MediaFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id',
        'pledge_id',
        'loan_id',
        'jewel_id',
        'user_id',
        'type',
        'category',
        'file_path',
        'mime_type',
        'size',
    ];

    protected $appends = ['url'];

    /* =======================
       Relationships
    ======================== */

    public function user()
    {
        return $this->belongsTo(\App\Models\Admin\Organization\User\User::class);
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function pledge()
    {
        return $this->belongsTo(Pledge::class);
    }

    public function loan()
    {
        return $this->belongsTo(Loan::class);
    }

    public function jewel()
    {
        return $this->belongsTo(Jewel::class);
    }

    /* =======================
       Accessors
    ======================== */

    public function getUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }

        return Storage::url($this->file_path);
    }
}
