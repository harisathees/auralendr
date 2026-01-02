<?php

namespace App\Models\Admin\LoanConfiguration;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LoanScheme extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'interest_rate',
        'interest_period',
        'calculation_type',
        'scheme_config',
        'status',
    ];

    protected $casts = [
        'scheme_config' => 'array',
        'interest_rate' => 'float',
    ];
}
