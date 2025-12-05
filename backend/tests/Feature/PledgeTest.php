<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\BranchAndUser\User;
use App\Models\pledge\Pledge;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PledgeTest extends TestCase
{
    use RefreshDatabase;

    public function test_staff_cannot_view_other_branch_pledges()
    {
        // seed roles & permissions
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);

        // create two branches that match your migration schema
        $branchA = \DB::table('branches')->insertGetId([
            'branch_name' => 'A',
            'location' => 'Test Location A',
            'created_at'=> now(),
            'updated_at'=> now(),
        ]);

        $branchB = \DB::table('branches')->insertGetId([
            'branch_name' => 'B',
            'location' => 'Test Location B',
            'created_at'=> now(),
            'updated_at'=> now(),
        ]);

        // create staff in each branch
        $staffA = User::factory()->create(['branch_id' => $branchA]);
        $staffA->assignRole('staff');

        $staffB = User::factory()->create(['branch_id' => $branchB]);
        $staffB->assignRole('staff');

        // create customer for the pledge
        $custId = \DB::table('customers')->insertGetId([
            'name' => 'Customer Test',
            'created_at'=> now(),
            'updated_at'=> now(),
        ]);

        // create pledge in branch B (staffB's branch)
        $pledgeId = \DB::table('pledges')->insertGetId([
            'customer_id' => $custId,
            'branch_id' => $branchB,
            'created_by' => $staffB->id,
            'updated_by' => $staffB->id,
            'status' => 'active',
            'created_at'=> now(),
            'updated_at'=> now(),
        ]);

        // staffA (branch A) should NOT see pledges from branch B
        $this->actingAs($staffA, 'sanctum')
            ->getJson('/api/pledges')
            ->assertStatus(200)
            ->assertJsonMissing(['id' => $pledgeId]); // IDOR protection
    }
}
