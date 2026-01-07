<?php

namespace App\Http\Controllers\Api\V1\Admin\Configuration;

use App\Http\Controllers\Controller;
use App\Models\Admin\ReceiptTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReceiptTemplateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $templates = ReceiptTemplate::all();
        return response()->json($templates);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'papersize' => 'required|array',
            'orientation' => 'required|string|in:portrait,landscape',
            'margin' => 'required|array',
            'layout_config' => 'required|array',
            'status' => 'required|string|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $template = ReceiptTemplate::create($request->all());

        return response()->json([
            'message' => 'Template created successfully',
            'template' => $template
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $template = ReceiptTemplate::findOrFail($id);
        return response()->json($template);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $template = ReceiptTemplate::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'papersize' => 'sometimes|array',
            'orientation' => 'sometimes|string|in:portrait,landscape',
            'margin' => 'sometimes|array',
            'layout_config' => 'sometimes|array',
            'status' => 'sometimes|string|in:active,inactive',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $template->update($request->all());

        return response()->json([
            'message' => 'Template updated successfully',
            'template' => $template
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $template = ReceiptTemplate::findOrFail($id);
        $template->delete();

        return response()->json([
            'message' => 'Template deleted successfully'
        ]);
    }
}
