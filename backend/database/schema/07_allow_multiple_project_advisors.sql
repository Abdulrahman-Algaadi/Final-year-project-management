-- Allow multiple advisors per project (including the same role).
-- Run on existing databases after schema_full.sql / 06_auth_soft_delete_enhancements.sql

ALTER TABLE project_advisor
    DROP CONSTRAINT IF EXISTS uq_project_advisor_project_role;
