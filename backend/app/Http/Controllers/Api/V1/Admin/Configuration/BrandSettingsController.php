<?php

namespace App\Http\Controllers\Api\V1\Admin\Configuration;

use App\Http\Controllers\Controller;
use App\Models\Settings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BrandSettingsController extends Controller
{
    public function index()
    {
        $settings = Settings::where('key', 'like', 'brand_%')->get()->pluck('value', 'key');

        // Ensure image URLs are full URLs
        if (isset($settings['brand_logo'])) {
            // Storage::url() returns http://localhost/... which is wrong because of APP_URL
            // We manually construct the URL using the current request root + /storage/ + filename
            $settings['brand_logo_url'] = request()->root() . '/storage/' . $settings['brand_logo'];
        }

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $data = $request->except(['brand_logo']);

        // Handle text fields
        foreach ($data as $key => $value) {
            if (str_starts_with($key, 'brand_')) {
                Settings::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value]
                );
            }
        }

        // Handle File Upload
        if ($request->hasFile('brand_logo')) {
            $file = $request->file('brand_logo');
            $path = $file->store('brand', 'public');
            Settings::updateOrCreate(
                ['key' => 'brand_logo'],
                ['value' => $path]
            );
        } elseif ($request->has('brand_logo_remove') && $request->brand_logo_remove == 'true') {
            Settings::updateOrCreate(
                ['key' => 'brand_logo'],
                ['value' => null]
            );
        }

        return response()->json(['message' => 'Brand settings updated successfully']);
    }
}
