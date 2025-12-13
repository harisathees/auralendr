<?php

namespace App\Models\pledge;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Customer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name','mobile_no','whatsapp_no','address','sub_address',
        'id_proof_type','id_proof_number'
    ];

    public function pledges()
    {
        return $this->hasMany(Pledge::class);
    }

    public function media()
    {
        return $this->hasMany(MediaFile::class);
    }
}
