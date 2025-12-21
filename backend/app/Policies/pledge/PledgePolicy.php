<?php

namespace App\Policies\Pledge;

use App\Models\Admin\Organization\User\User;
use App\Models\Pledge\Pledge;
use Illuminate\Auth\Access\HandlesAuthorization;

class PledgePolicy
{
    use HandlesAuthorization;

    public function before(User $user, $ability)
    {
        // Only developer/superadmin bypass checks
        if ($user->hasRole('developer') || $user->role === 'developer' || $user->role === 'superadmin') {
            return true;
        }
    }

    public function view(User $user, Pledge $pledge): bool
    {
        if (!$user->can('pledge.view')) {
            return false;
        }
        
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->branch_id !== null && $user->branch_id === $pledge->branch_id;
    }

    public function create(User $user): bool
    {
        return $user->can('pledge.create');
    }

    public function update(User $user, Pledge $pledge): bool
    {
        if (!$user->can('pledge.update')) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->branch_id !== null && $user->branch_id === $pledge->branch_id;
    }

    public function delete(User $user, Pledge $pledge): bool
    {
        if (!$user->can('pledge.delete')) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->branch_id !== null && $user->branch_id === $pledge->branch_id;
    }
}
