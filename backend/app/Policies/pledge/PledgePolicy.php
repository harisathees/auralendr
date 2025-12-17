<?php

namespace App\Policies\pledge;

use App\Models\BranchAndUser\User;
use App\Models\pledge\Pledge;
use Illuminate\Auth\Access\HandlesAuthorization;

class PledgePolicy
{
    use HandlesAuthorization;

    public function before(User $user, $ability)
    {
        // admins bypass checks
        if ($user->hasRole('admin') || $user->role === 'admin') {
            return true;
        }
    }

    public function view(User $user, Pledge $pledge): bool
    {
        // staff only view pledges from their branch
        return $user->branch_id !== null && $user->branch_id === $pledge->branch_id;
    }

    public function create(User $user): bool
    {
        return $user->can('pledge.create');
    }

    public function update(User $user, Pledge $pledge): bool
    {
        $isStaff = $user->hasRole('staff') || $user->role === 'staff';
        return $user->branch_id !== null && $user->branch_id === $pledge->branch_id && ($isStaff || $user->can('pledge.update'));
    }

    public function delete(User $user, Pledge $pledge): bool
    {
        $isStaff = $user->hasRole('staff') || $user->role === 'staff';
        return $user->branch_id !== null && $user->branch_id === $pledge->branch_id && ($isStaff || $user->can('pledge.delete'));
    }
}
