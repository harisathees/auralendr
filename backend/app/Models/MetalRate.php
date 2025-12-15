<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MetalRate extends Model
{
    use HasFactory;

    protected $fillable = [
        'jewel_type_id',
        'rate',
        'previous_rate',
    ];

    /**
     * Get the jewel type that owns the rate.
     */
    public function jewelType(): BelongsTo
    {
        return $this->belongsTo(JewelType::class);
    }
}
