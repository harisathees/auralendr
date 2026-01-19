<?php

namespace App\Models\Pledge;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;

class Customer extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'mobile_no',
        'whatsapp_no',
        'address',
        'sub_address',
        'id_proof_type',
        'id_proof_number'
    ];

    protected $appends = ['document_url', 'image_url'];

    public function pledges()
    {
        return $this->hasMany(Pledge::class);
    }

    public function media()
    {
        return $this->hasMany(MediaFile::class);
    }

    public function getDocumentUrlAttribute()
    {
        $doc = $this->media->where('category', 'customer_document')->last();
        return $doc ? url(\Illuminate\Support\Facades\Storage::url($doc->file_path)) : null;
    }

    public function getImageUrlAttribute()
    {
        $img = $this->media->where('category', 'customer_image')->last();
        return $img ? url(\Illuminate\Support\Facades\Storage::url($img->file_path)) : null;
    }
}

