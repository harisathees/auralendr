<?php

namespace App\Models\Admin\JewelManagement;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JewelQuality extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'is_active'];
}
