<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use App\Models\pledge\Pledge;
use App\Policies\pledge\PledgePolicy;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Pledge::class => PledgePolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
