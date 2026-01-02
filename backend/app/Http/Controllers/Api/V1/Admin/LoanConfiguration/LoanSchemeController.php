<?php

namespace App\Http\Controllers\Api\V1\Admin\LoanConfiguration;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\Admin\LoanConfiguration\LoanScheme;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class LoanSchemeController extends Controller
{
    /**
     * GET /api/v1/loan-schemes
     */
    public function index(Request $request)
    {
        $query = LoanScheme::query();

        if ($request->query('status') === 'active') {
            $query->where('status', 'active');
        }

        return response()->json($query->get());
    }

    /**
     * POST /api/v1/loan-schemes
     */
    public function store(Request $request)
    {
        // Permission check can be added here
        // if (!$request->user()->can('loan_schemes.create')) abort(403);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:loan_schemes',
            'description' => 'nullable|string',
            'interest_rate' => 'required|numeric|min:0', // e.g., 2.00
            'interest_period' => 'required|string|in:monthly,daily,yearly',
            'calculation_type' => 'required|string|in:simple,compound,day_basis,tiered',
            'scheme_config' => 'nullable|array',
            'status' => 'required|in:active,inactive',
        ]);

        $scheme = LoanScheme::create($validated);

        return response()->json($scheme, 201);
    }

    /**
     * PUT /api/v1/loan-schemes/{id}
     */
    public function update(Request $request, $id)
    {
        $scheme = LoanScheme::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('loan_schemes')->ignore($scheme->id)],
            'description' => 'nullable|string',
            'interest_rate' => 'sometimes|numeric|min:0',
            'interest_period' => 'sometimes|string|in:monthly,daily,yearly',
            'calculation_type' => 'sometimes|string|in:simple,compound,day_basis,tiered',
            'scheme_config' => 'nullable|array',
            'status' => 'sometimes|in:active,inactive',
        ]);

        $scheme->update($validated);

        return response()->json($scheme);
    }

    /**
     * DELETE /api/v1/loan-schemes/{id}
     */
    public function destroy($id)
    {
        $scheme = LoanScheme::findOrFail($id);
        $scheme->delete();
        return response()->json(null, 204);
    }
}
