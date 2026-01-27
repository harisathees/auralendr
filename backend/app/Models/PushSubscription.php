<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Minishlink\WebPush\Subscription;

class PushSubscription extends Model
{
    protected $fillable = [
        'endpoint',
        'public_key',
        'auth_token',
        'content_encoding',
    ];

    /**
     * Get the subscribable entity that the subscription belongs to.
     */
    public function subscribable()
    {
        return $this->morphTo();
    }
}
