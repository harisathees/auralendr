<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Pledge\MediaFile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Gate;

class MediaController extends Controller
{
    /**
     * securely stream a media file to the client
     * This endpoint ensures the user is authenticated and authorized to view the file.
     */
    public function stream(Request $request, MediaFile $mediaFile)
    {
        $user = $request->user();

        // 1. Authorization: Check if user has permission to view pledges in general
        if (!$user->can('pledge.view')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        // 2. Resource Authorization: Check if the user belongs to the same branch as the pledge
        // We load the pledge relationship if not already loaded (though strictly we just need the branch_id)
        $mediaFile->load('pledge');
        
        if ($mediaFile->pledge) {
            // If user is not admin, they can only view pledges from their branch
            if (!$user->hasRole('admin') && $mediaFile->pledge->branch_id !== $user->branch_id) {
                 return response()->json(['message' => 'Unauthorized access to this file'], 403);
            }
        }

        // 3. File Validation: Check if the file actually exists on the disk
        if (!Storage::disk('public')->exists($mediaFile->file_path)) {
            return response()->json(['message' => 'File not found on server'], 404);
        }

        // 4. Secure Serving: Stream the file with correct headers
        // Headers ensure browser treats it correctly and allows cross-origin use if needed (via API middleware)
        return Storage::disk('public')->response($mediaFile->file_path);
    }
}
