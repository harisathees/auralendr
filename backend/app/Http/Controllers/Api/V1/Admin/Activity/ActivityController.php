<?php

namespace App\Http\Controllers\Api\V1\Admin\Activity;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;

class ActivityController extends Controller
{
    public function index(Request $request)
    {
        // Permission check
        if ($request->user()->hasRole('staff') && !$request->user()->hasRole(['admin', 'superadmin'])) {
            // Force filter by own ID if staff
            $request->merge(['user_id' => $request->user()->id]);
        }

        $query = Activity::with('user')
            ->whereHas('user', function ($q) {
                $q->where('role', '!=', 'developer');
            });

        if ($request->has('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->has('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->has('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', "%{$search}%");
                    });
            });
        }

        $activities = $query->latest()->paginate($request->input('per_page', 10));

        return response()->json($activities);
    }
}
