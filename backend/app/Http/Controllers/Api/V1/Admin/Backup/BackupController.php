<?php

namespace App\Http\Controllers\Api\V1\Admin\Backup;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use ZipArchive;
use Symfony\Component\HttpFoundation\StreamedResponse;

class BackupController extends Controller
{
    // List of tables to export
    protected $tables = [
        'users',
        'customers',
        'loans',
        'pledges',
        'repledges',
        'transactions',
        'capital_sources',
        'loan_payments',
        'pending_approvals',
        'activity_log' // Spatie activity log table name usually
    ];

    public function export(Request $request)
    {
        $type = $request->query('type', 'raw'); // 'raw' or 'readable'

        return new StreamedResponse(function () use ($type) {
            $zip = new ZipArchive;
            $zipFile = tempnam(sys_get_temp_dir(), 'backup_zip');

            if ($zip->open($zipFile, ZipArchive::CREATE | ZipArchive::OVERWRITE) === TRUE) {

                foreach ($this->tables as $table) {
                    if (!Schema::hasTable($table))
                        continue;

                    $buffer = fopen('php://temp', 'r+');

                    // Fetch Data
                    $query = DB::table($table);

                    // Basic chunking to handle memory
                    $query->orderBy('id')->chunk(500, function ($rows) use ($buffer, $table, $type) {
                        static $headersAdded = false;

                        foreach ($rows as $row) {
                            $rowArray = (array) $row;

                            if ($type === 'readable') {
                                $rowArray = $this->transformReadable($table, $rowArray);
                            }

                            if (!$headersAdded) {
                                fputcsv($buffer, array_keys($rowArray));
                                $headersAdded = true;
                            }

                            fputcsv($buffer, $rowArray);
                        }
                    });

                    rewind($buffer);
                    $content = stream_get_contents($buffer);
                    fclose($buffer);

                    $zip->addFromString("{$table}.csv", $content);
                }

                $zip->close();
            }

            readfile($zipFile);
            unlink($zipFile);

        }, 200, [
            'Content-Type' => 'application/zip',
            'Content-Disposition' => 'attachment; filename="auralendr_backup_' . $type . '_' . date('Y-m-d_H-i-s') . '.zip"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0'
        ]);
    }

    protected function transformReadable($table, $row)
    {
        // 1. Format Dates
        foreach ($row as $key => $value) {
            if (str_contains($key, '_at') || str_contains($key, 'date') || $key === 'dob') {
                if ($value) {
                    try {
                        $row[$key] = \Carbon\Carbon::parse($value)->format('d M Y h:i A');
                    } catch (\Exception $e) {
                    }
                }
            }
        }

        // 2. Specific Table Logic
        switch ($table) {
            case 'users':
                if (isset($row['branch_id'])) {
                    $branch = DB::table('branches')->where('id', $row['branch_id'])->value('name');
                    $row['branch_id'] = $branch ?? 'N/A';
                }
                break;

            case 'loans':
                if (isset($row['customer_id'])) {
                    $customer = DB::table('customers')->where('id', $row['customer_id'])->first();
                    $row['customer_id'] = $customer ? ($customer->first_name . ' ' . $customer->last_name) : 'N/A';
                }
                if (isset($row['scheme_id'])) {
                    $row['scheme_id'] = DB::table('loan_schemes')->where('id', $row['scheme_id'])->value('name') ?? 'N/A';
                }
                $row['status'] = ucfirst($row['status'] ?? '');
                break;

            case 'pledges':
                if (isset($row['loan_id'])) {
                    $row['loan_id'] = DB::table('loans')->where('id', $row['loan_id'])->value('loan_no') ?? 'N/A';
                }
                break;

            case 'repledges':
                if (isset($row['loan_id'])) {
                    $row['loan_id'] = DB::table('loans')->where('id', $row['loan_id'])->value('loan_no') ?? 'N/A';
                }
                if (isset($row['repledge_source_id'])) {
                    $row['repledge_source_id'] = DB::table('repledge_sources')->where('id', $row['repledge_source_id'])->value('name') ?? 'N/A';
                }
                break;

            case 'transactions':
                if (isset($row['user_id'])) {
                    $row['user_id'] = DB::table('users')->where('id', $row['user_id'])->value('name') ?? 'System';
                }
                if (isset($row['category_id'])) {
                    $row['category_id'] = DB::table('transaction_categories')->where('id', $row['category_id'])->value('name') ?? 'N/A';
                }
                break;

            case 'pending_approvals':
                if (isset($row['requested_by'])) {
                    $row['requested_by'] = DB::table('users')->where('id', $row['requested_by'])->value('name') ?? 'N/A';
                }
                if (isset($row['approved_by'])) {
                    $row['approved_by'] = DB::table('users')->where('id', $row['approved_by'])->value('name') ?? 'N/A';
                }
                break;
        }

        return $row;
    }
}
