<?php

namespace App\Models\BranchAndUser;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_name',
        'location',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
