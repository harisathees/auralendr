<?php

namespace App\Models\Admin\LoanConfiguration;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Admin\JewelManagement\JewelType;
use App\Models\Admin\Organization\Branch\Branch;

class LoanProcessingFee extends Model
{
    use HasFactory;

    protected $table = 'processing_fees';

    protected $fillable = [
        'jewel_type_id',
        'branch_id',
        'percentage',
        'max_amount',
    ];

    public function jewelType()
    {
        return $this->belongsTo(JewelType::class);
    }

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
}
