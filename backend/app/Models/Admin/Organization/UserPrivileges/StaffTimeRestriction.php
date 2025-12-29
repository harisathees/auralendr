<?php

namespace App\Models\Admin\Organization\UserPrivileges;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StaffTimeRestriction extends Model
{
    use HasFactory;

    protected $table = 'staff_time_restrictions';

    protected $fillable = ['key', 'value', 'group', 'branch_id'];
}
