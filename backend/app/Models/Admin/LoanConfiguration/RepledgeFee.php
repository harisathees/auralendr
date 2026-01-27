<?php

namespace App\Models\Admin\LoanConfiguration;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Admin\JewelManagement\JewelType;

class RepledgeFee extends Model
{
    use HasFactory;

    protected $table = 'repledge_fees';

    protected $fillable = [
        'jewel_type_id',
        'percentage',
        'max_amount',
    ];

    public function jewelType()
    {
        return $this->belongsTo(JewelType::class);
    }
}
