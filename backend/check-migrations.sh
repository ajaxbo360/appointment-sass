#!/bin/bash

echo "Checking for duplicate migrations..."

# Get all migration files
migrations=$(ls -1 database/migrations/*.php)

# Extract table names from migration files
declare -A tables

for migration in $migrations; do
    # Extract table name from filename
    if [[ $migration =~ create_([a-z_]+)_table ]]; then
        table=${BASH_REMATCH[1]}

        if [[ -n "${tables[$table]}" ]]; then
            echo "WARNING: Duplicate migration for table '$table':"
            echo "  - ${tables[$table]}"
            echo "  - $migration"
        else
            tables[$table]=$migration
        fi
    fi
done

echo "Migration check complete."
