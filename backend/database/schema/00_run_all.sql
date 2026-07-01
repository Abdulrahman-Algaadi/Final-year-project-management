-- Run all schema scripts in order (Supabase SQL Editor or psql).
-- Example: psql "$DATABASE_URL" -f 00_run_all.sql

\ir 01_extensions.sql
\ir 02_tables.sql
\ir 03_indexes.sql
\ir 04_lookup_validation.sql
\ir 05_seed_data.sql
