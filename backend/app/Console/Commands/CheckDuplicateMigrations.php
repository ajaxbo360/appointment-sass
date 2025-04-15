<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class CheckDuplicateMigrations extends Command
{
    protected $signature = 'migrations:check';
    protected $description = 'Check for duplicate migration files';

    public function handle()
    {
        $this->info('Checking for duplicate migrations...');

        $migrationPath = database_path('migrations');
        $files = File::files($migrationPath);

        $tables = [];
        $duplicates = false;

        foreach ($files as $file) {
            $filename = $file->getFilename();

            // Extract table name from filename
            if (preg_match('/create_([a-z_]+)_table/', $filename, $matches)) {
                $table = $matches[1];

                if (isset($tables[$table])) {
                    $this->error("Duplicate migration for table '$table':");
                    $this->error("  - {$tables[$table]}");
                    $this->error("  - $filename");
                    $duplicates = true;
                } else {
                    $tables[$table] = $filename;
                }
            }
        }

        if (!$duplicates) {
            $this->info('No duplicate migrations found.');
        }

        return $duplicates ? 1 : 0;
    }
}
