<?php

namespace App\Models\Admin\LoanConfiguration;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\Admin\JewelManagement\JewelType;

class InterestRate extends Model
{
    use HasFactory;

    protected $fillable = ['rate', 'post_validity_rate', 'estimation_percentage', 'jewel_type_id'];

    public function jewelType()
    {
        return $this->belongsTo(JewelType::class);
    }
}
