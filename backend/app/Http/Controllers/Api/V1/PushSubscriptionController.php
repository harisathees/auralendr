<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class PushSubscriptionController extends Controller
{
    /**
     * Subscribe to push notifications.
     */
    public function subscribe(Request $request)
    {
        $this->validate($request, [
            'endpoint' => 'required',
            'keys.auth' => 'nullable|string',
            'keys.p256dh' => 'nullable|string',
        ]);

        $endpoint = $request->endpoint;
        $token = $request->input('keys.auth');
        $key = $request->input('keys.p256dh');
        $contentEncoding = $request->input('contentEncoding');

        $request->user()->updatePushSubscription($endpoint, $key, $token, $contentEncoding);

        return response()->json(['message' => 'Subscribed to push notifications successfully.']);
    }

    /**
     * Unsubscribe from push notifications.
     */
    public function unsubscribe(Request $request)
    {
        $this->validate($request, [
            'endpoint' => 'required',
        ]);

        $request->user()->deletePushSubscription($request->endpoint);

        return response()->json(['message' => 'Unsubscribed from push notifications successfully.']);
    }

    /**
     * Get VAPID public key.
     */
    public function publicKey()
    {
        return response()->json(['key' => env('VAPID_PUBLIC_KEY')]);
    }
}
