<?php

namespace App\Models\pledge;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pledge extends Model
{
    use HasFactory;

    protected $fillable = [
        'customer_id','branch_id','created_by','updated_by','status','reference_no'
    ];

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

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
}
