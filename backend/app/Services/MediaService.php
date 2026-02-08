<?php

namespace App\Services;

use App\Models\Pledge\MediaFile;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class MediaService
{
    /**
     * Handle file uploads for a pledge.
     *
     * @param \Illuminate\Http\Request|array $requestOrFiles
     * @param array $relatedModels ['customer_id' => int, 'pledge_id' => int, 'loan_id' => int, 'user_id' => string]
     * @param array $categories
     * @param string $loanNo
     * @return void
     */
    public function handleUploads($files, array $relatedModels, array $categories, string $loanNo)
    {
        // Normalize files input to array
        if (!is_array($files)) {
            // If it's a single UploadedFile, wrap it
            if ($files instanceof UploadedFile) {
                $files = [$files];
            } else {
                // If it's something else (null, or random data), just make empty array to be safe
                $files = [];
            }
        }

        foreach ($files as $index => $file) {
            if (!($file instanceof UploadedFile)) {
                continue;
            }

            $timestamp = now()->format('Ymd_His');
            $loanNoSafe = preg_replace('/[^A-Za-z0-9\-]/', '', $loanNo);

            // Determine category
            // The frontend sends categories as an array corresponding to files
            // If the files key is discontinuous or associative, we need to ensure we map correctly.
            // However, usually they align. If not, fallback to default.
            $category = $categories[$index] ?? 'uploaded_file';

            $extension = $file->getClientOriginalExtension();
            $filename = "{$category}_{$loanNoSafe}_{$timestamp}_" . uniqid() . ".{$extension}";

            try {
                $path = $file->storeAs('pledge_media', $filename, 'public');

                MediaFile::create([
                    'customer_id' => $relatedModels['customer_id'] ?? null,
                    'pledge_id' => $relatedModels['pledge_id'] ?? null,
                    'loan_id' => $relatedModels['loan_id'] ?? null,
                    'user_id' => $relatedModels['user_id'] ?? null,
                    'jewel_id' => $relatedModels['jewel_id'] ?? null,
                    'type' => explode('/', $file->getClientMimeType())[0] ?? 'file',
                    'category' => $category,
                    'file_path' => $path,
                    'mime_type' => $file->getClientMimeType(),
                    'size' => $file->getSize(),
                ]);

                Log::info('Media file uploaded', [
                    'path' => $path,
                    'category' => $category,
                    'pledge_id' => $relatedModels['pledge_id'] ?? 'N/A'
                ]);

            } catch (\Exception $e) {
                Log::error('Failed to upload media file', [
                    'filename' => $filename,
                    'error' => $e->getMessage()
                ]);
                // Depending on requirements, we might throw or just log. 
                // For enterprise, partial failure might be acceptable or transaction rollbacks.
                // Since this is usually inside a transaction in Controller, throwing is safer.
                throw $e;
            }
        }
    }

    /**
     * Delete specific media files.
     *
     * @param array $fileIds
     * @param int $pledgeId Security check to ensure we only delete files for this pledge
     * @return void
     */
    public function deleteFiles(array $fileIds, int $pledgeId)
    {
        if (empty($fileIds))
            return;

        $filesToDelete = MediaFile::whereIn('id', $fileIds)
            ->where('pledge_id', $pledgeId)
            ->get();

        foreach ($filesToDelete as $fileRecord) {
            // Delete physical file
            if ($fileRecord->file_path && Storage::disk('public')->exists($fileRecord->file_path)) {
                Storage::disk('public')->delete($fileRecord->file_path);
            }
            // Delete record
            $fileRecord->delete();

            Log::info('Media file deleted', ['id' => $fileRecord->id, 'path' => $fileRecord->file_path]);
        }
    }

    /**
     * Delete specific media files for a user.
     *
     * @param array $fileIds
     * @param string $userId Security check
     * @return void
     */
    public function deleteUserFiles(array $fileIds, string $userId)
    {
        if (empty($fileIds))
            return;

        $filesToDelete = MediaFile::whereIn('id', $fileIds)
            ->where('user_id', $userId)
            ->get();

        foreach ($filesToDelete as $fileRecord) {
            if ($fileRecord->file_path && Storage::disk('public')->exists($fileRecord->file_path)) {
                Storage::disk('public')->delete($fileRecord->file_path);
            }
            $fileRecord->delete();
            Log::info('User Media file deleted', ['id' => $fileRecord->id, 'path' => $fileRecord->file_path]);
        }
    }
}
