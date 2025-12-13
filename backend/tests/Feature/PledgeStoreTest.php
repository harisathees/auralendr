<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\BranchAndUser\User;
use App\Models\BranchAndUser\Branch;
use App\Models\pledge\Pledge;
use App\Models\pledge\Customer;
use App\Models\pledge\Loan;
use App\Models\pledge\Jewel;
use Spatie\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class PledgeStoreTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        // Seed roles and permissions
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
    }

    /** @test */
    public function it_requires_branch_id_to_create_pledge()
    {
        // Create user without branch_id
        $user = User::factory()->create([
            'branch_id' => null,
            'role' => 'staff'
        ]);
        $role = Role::where('name', 'staff')->where('guard_name', 'sanctum')->first();
        $user->assignRole($role);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/pledges', [
                'customer' => [
                    'name' => 'Test Customer',
                    'mobile_no' => '1234567890',
                ],
                'loan' => [
                    'amount' => 10000,
                    'interest_percentage' => 2.5,
                ],
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'User must be assigned to a branch to create pledges',
                'error' => 'missing_branch_id'
            ]);
    }

    /** @test */
    public function it_can_create_pledge_with_valid_data()
    {
        // Create branch
        $branch = Branch::create([
            'branch_name' => 'Test Branch',
            'location' => 'Test Location',
        ]);

        // Create user with branch_id
        $user = User::factory()->create([
            'branch_id' => $branch->id,
            'role' => 'staff'
        ]);
        $role = Role::where('name', 'staff')->where('guard_name', 'sanctum')->first();
        $user->assignRole($role);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/pledges', [
                'customer' => [
                    'name' => 'Test Customer',
                    'mobile_no' => '1234567890',
                    'whatsapp_no' => '1234567890',
                    'address' => 'Test Address',
                ],
                'loan' => [
                    'amount' => 10000,
                    'interest_percentage' => 2.5,
                    'validity_months' => 6,
                ],
                'jewels' => [
                    [
                        'jewel_type' => 'Gold Chain',
                        'quality' => '22K',
                        'pieces' => 1,
                        'weight' => 10.5,
                    ],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'data' => [
                    'id',
                    'customer_id',
                    'branch_id',
                    'customer',
                    'loan',
                    'jewels',
                ]
            ]);

        // Verify data was saved
        $this->assertDatabaseHas('customers', [
            'name' => 'Test Customer',
        ]);

        $this->assertDatabaseHas('pledges', [
            'branch_id' => $branch->id,
            'created_by' => $user->id,
        ]);

        $this->assertDatabaseHas('loans', [
            'amount' => 10000,
        ]);

        $this->assertDatabaseHas('jewels', [
            'jewel_type' => 'Gold Chain',
        ]);
    }

    /** @test */
    public function it_can_handle_file_uploads_with_array_notation()
    {
        Storage::fake('public');

        // Create branch
        $branch = Branch::create([
            'branch_name' => 'Test Branch',
            'location' => 'Test Location',
        ]);

        // Create user with branch_id
        $user = User::factory()->create([
            'branch_id' => $branch->id,
            'role' => 'staff'
        ]);
        $role = Role::where('name', 'staff')->where('guard_name', 'sanctum')->first();
        $user->assignRole($role);

        $file1 = UploadedFile::fake()->image('test1.jpg', 100, 100);
        $file2 = UploadedFile::fake()->image('test2.jpg', 100, 100);

        $response = $this->actingAs($user, 'sanctum')
            ->post('/api/pledges', [
                'customer' => [
                    'name' => 'Test Customer',
                    'mobile_no' => '1234567890',
                ],
                'loan' => [
                    'amount' => 10000,
                ],
                'files' => [$file1, $file2], // Array notation
            ]);

        $response->assertStatus(201);

        // Verify files were stored
        Storage::disk('public')->assertExists('pledge_media/' . $file1->hashName());
        Storage::disk('public')->assertExists('pledge_media/' . $file2->hashName());

        // Verify MediaFile records were created
        $pledge = Pledge::latest()->first();
        $this->assertEquals(2, $pledge->media()->count());
    }

    /** @test */
    public function it_handles_pledge_creation_without_files()
    {
        // Create branch
        $branch = Branch::create([
            'branch_name' => 'Test Branch',
            'location' => 'Test Location',
        ]);

        // Create user with branch_id
        $user = User::factory()->create([
            'branch_id' => $branch->id,
            'role' => 'staff'
        ]);
        $role = Role::where('name', 'staff')->where('guard_name', 'sanctum')->first();
        $user->assignRole($role);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/pledges', [
                'customer' => [
                    'name' => 'Test Customer',
                    'mobile_no' => '1234567890',
                ],
                'loan' => [
                    'amount' => 10000,
                ],
            ]);

        $response->assertStatus(201);

        $pledge = Pledge::latest()->first();
        $this->assertEquals(0, $pledge->media()->count());
    }

    /** @test */
    public function it_requires_permission_to_create_pledge()
    {
        // Create branch
        $branch = Branch::create([
            'branch_name' => 'Test Branch',
            'location' => 'Test Location',
        ]);

        // Create user without pledge.create permission
        $user = User::factory()->create([
            'branch_id' => $branch->id,
            'role' => 'staff'
        ]);
        // Don't assign any role/permission

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/pledges', [
                'customer' => [
                    'name' => 'Test Customer',
                ],
                'loan' => [
                    'amount' => 10000,
                ],
            ]);

        $response->assertStatus(403);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        // Create branch
        $branch = Branch::create([
            'branch_name' => 'Test Branch',
            'location' => 'Test Location',
        ]);

        // Create user with branch_id
        $user = User::factory()->create([
            'branch_id' => $branch->id,
            'role' => 'staff'
        ]);
        $role = Role::where('name', 'staff')->where('guard_name', 'sanctum')->first();
        $user->assignRole($role);

        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/pledges', [
                'customer' => [
                    // Missing required 'name' field
                ],
                'loan' => [
                    // Missing required 'amount' field
                ],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors([
                'customer.name',
                'loan.amount',
            ]);
    }
}

