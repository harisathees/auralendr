<?php

namespace App\Traits;

use App\Models\PushSubscription;

trait HasPushSubscriptions
{
    /**
     * Get the push subscriptions for the entity.
     */
    public function pushSubscriptions()
    {
        return $this->morphMany(PushSubscription::class, 'subscribable');
    }

    /**
     * Update (or create) a subscription.
     */
    public function updatePushSubscription($endpoint, $key = null, $token = null, $contentEncoding = null)
    {
        $subscription = $this->pushSubscriptions()->where('endpoint', $endpoint)->first();

        if ($subscription) {
            $subscription->update([
                'public_key' => $key,
                'auth_token' => $token,
                'content_encoding' => $contentEncoding,
            ]);
        } else {
            $this->pushSubscriptions()->create([
                'endpoint' => $endpoint,
                'public_key' => $key,
                'auth_token' => $token,
                'content_encoding' => $contentEncoding,
            ]);
        }

        return $subscription;
    }

    /**
     * Delete a subscription.
     */
    public function deletePushSubscription($endpoint)
    {
        $this->pushSubscriptions()->where('endpoint', $endpoint)->delete();
    }
}
