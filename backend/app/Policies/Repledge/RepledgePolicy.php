<?php

namespace App\Policies\Repledge;

use App\Models\Admin\Organization\User\User;
use App\Models\Repledge\Repledge;
use Illuminate\Auth\Access\HandlesAuthorization;

class RepledgePolicy
{
    use HandlesAuthorization;

    public function before(User $user, $ability)
    {
        // Developer and Superadmin bypass all checks
        if ($user->hasRole('developer') || $user->role === 'developer' || $user->role === 'superadmin') {
            return true;
        }
    }

    public function view(User $user, Repledge $repledge)
    {
        if (!$user->can('repledge.view')) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        // Staff can only view repledges in their branch
        return $user->branch_id !== null && $user->branch_id === $repledge->branch_id;
    }

    public function create(User $user)
    {
        return $user->can('repledge.create');
    }

    public function update(User $user, Repledge $repledge)
    {
        if (!$user->can('repledge.update')) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->branch_id !== null && $user->branch_id === $repledge->branch_id;
    }

    public function delete(User $user, Repledge $repledge)
    {
        if (!$user->can('repledge.delete')) {
            return false;
        }

        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->branch_id !== null && $user->branch_id === $repledge->branch_id;
    }
}
