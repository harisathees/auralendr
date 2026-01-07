<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ReceiptTemplate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'papersize',
        'orientation',
        'margin',
        'version',
        'layout_config',
        'status',
    ];

    protected $casts = [
        'papersize' => 'array',
        'margin' => 'array',
        'layout_config' => 'array',
        'version' => 'integer',
    ];
}
