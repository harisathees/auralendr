<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use App\Models\Pledge\Loan;

class CustomerAppSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_app_flow()
    {
        // 1. Setup Data
        $branchId = (string) Str::ulid();
        \DB::table('branches')->insert([
            'id' => $branchId,
            'branch_name' => 'Branch A',
            'created_at' => now(), 'updated_at' => now()
        ]);
        
        $custId = (string) Str::ulid();
        \DB::table('customers')->insert([
            'id' => $custId,
            'name' => 'Test Customer',
            'mobile_no' => '9876543210',
            'created_at' => now(), 'updated_at' => now()
        ]);

        $userId = (string) Str::ulid();
        \DB::table('users')->insert([
            'id' => $userId,
            'name' => 'Staff',
            'email' => 'staff@example.com',
            'password' => bcrypt('password'),
            'branch_id' => $branchId,
            'created_at' => now(), 'updated_at' => now()
        ]);

        $pledgeId = (string) Str::ulid();
        \DB::table('pledges')->insert([
            'id' => $pledgeId,
            'branch_id' => $branchId,
            'customer_id' => $custId,
            'created_by' => $userId,
            'status' => 'active',
            'created_at' => now(), 'updated_at' => now()
        ]);

        // 2. Disabled by default check - Observer logic
        
        $loan1 = new Loan();
        $loan1->pledge_id = $pledgeId;
        $loan1->amount = 1000;
        $loan1->status = 'active';
        $loan1->save(); // Triggers Observer

        // Assert no tracking record because setting is missing/disabled
        $this->assertDatabaseMissing('customer_loan_tracks', ['loan_id' => $loan1->id]);
        
        // 3. Enable Feature
        \DB::table('settings')->insert([
            'key' => 'enable_customer_app',
            'value' => '1',
            'branch_id' => $branchId,
            'created_at' => now(), 'updated_at' => now()
        ]);

        // 4. Create another loan (Observer should trigger)
        $loan2 = new Loan();
        $loan2->pledge_id = $pledgeId;
        $loan2->amount = 2000;
        $loan2->status = 'active';
        $loan2->save(); // Triggers Observer

        $this->assertDatabaseHas('customer_loan_tracks', ['loan_id' => $loan2->id]);
        
        $track = \App\Models\CustomerApp\CustomerLoanTrack::where('loan_id', $loan2->id)->first();
        
        // 5. Access API with Correct Digits
        // Route prefix api/customer defined in bootstrap
        $response = $this->getJson("/api/customer/track/{$track->tracking_code}?last_4_digits=3210");
        $response->assertStatus(200)
                 ->assertJsonPath('data.tracking_code', $track->tracking_code);

        // 6. Access API with Wrong Digits
        $response = $this->getJson("/api/customer/track/{$track->tracking_code}?last_4_digits=9999");
        $response->assertStatus(404);

        // 7. Disable Feature via DB
        \DB::table('settings')->where('key', 'enable_customer_app')->update(['value' => '0']);
        
        $response = $this->getJson("/api/customer/track/{$track->tracking_code}?last_4_digits=3210");
        $response->assertStatus(404);
    }
}
