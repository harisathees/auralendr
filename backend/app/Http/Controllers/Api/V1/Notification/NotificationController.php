<?php

namespace App\Http\Controllers\Api\V1\Notification;

use App\Http\Controllers\Api\V1\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Sync Pending Repledge Notifications (Ensure they exist for Admins)
        if ($user->hasRole('admin') || $user->hasRole('superadmin')) {
            $pendingRepledges = \App\Models\Repledge\Repledge::where('status', 'active')
                ->whereHas('loan', function ($q) {
                    $q->where('status', 'closed');
                })
                ->get();

            foreach ($pendingRepledges as $repledge) {
                // Check if notification exists for this user
                $exists = \Illuminate\Support\Facades\DB::table('notifications')
                    ->where('notifiable_type', get_class($user))
                    ->where('notifiable_id', $user->id)
                    ->where('type', 'App\Notifications\RepledgeClosurePending')
                    ->whereJsonContains('data->repledge_id', $repledge->id)
                    ->exists();

                if (!$exists) {
                    $repledge->load(['source', 'loan']); // Ensure relationships
                    $loanNo = $repledge->loan_no ?? ($repledge->loan ? $repledge->loan->loan_no : 'N/A');
                    $pledgeId = $repledge->loan ? $repledge->loan->pledge_id : null;

                    if ($pledgeId) {
                        $user->notify(new \App\Notifications\RepledgeClosurePending($loanNo, $pledgeId, $repledge));
                    }
                }
            }
        }

        $notifications = $user->notifications()->latest()->get();
        return response()->json($notifications);
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();
        if ($notification) {
            $notification->markAsRead();
        }
        return response()->json(['message' => 'Marked as read']);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All marked as read']);
    }
}
