<?php

namespace App\Services;

use App\Models\Activity;
use Illuminate\Support\Facades\Request;
use Illuminate\Support\Facades\Auth;

class ActivityService
{
    /**
     * Log an activity.
     *
     * @param string $action
     * @param string $description
     * @param mixed $subject (Optional) The model being acted upon
     */
    public function log(string $action, string $description, $subject = null, $performedBy = null)
    {
        $user = $performedBy ?? Auth::user();

        if (!$user) {
            return;
        }

        Activity::create([
            'user_id' => $user->id,
            'action' => $action,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject ? $subject->id : null,
            'description' => $description,
            'ip_address' => Request::ip(),
            'user_agent' => Request::header('User-Agent'),
        ]);
    }
}
