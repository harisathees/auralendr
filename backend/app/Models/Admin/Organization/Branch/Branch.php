<?php

namespace App\Models\Admin\Organization\Branch;

use App\Models\Admin\Organization\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'branch_name',
        'location',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }
}
