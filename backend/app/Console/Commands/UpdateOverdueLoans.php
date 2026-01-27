<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Pledge\Pledge;
use Carbon\Carbon;

class UpdateOverdueLoans extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:update-overdue-loans';

    /**
     * The console command descriptions.
     *
     * @var string
     */
    protected $description = 'Update pledge status to overdue if due date is passed';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $count = 0;
        Pledge::where('status', 'active')
            ->whereHas('loan', function ($query) {
                // Check if due_date is before today (meaning today is greater than due_date)
                $query->where('due_date', '<', Carbon::today());
            })
            ->chunk(100, function ($pledges) use (&$count) {
                foreach ($pledges as $pledge) {
                    $pledge->update(['status' => 'overdue']);
                    $count++;
                }
            });

        $this->info("Updated {$count} pledges to overdue status.");
    }
}
