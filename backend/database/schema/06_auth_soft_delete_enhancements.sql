-- Supabase Auth integration, soft delete, and domain enhancements
-- Run after schema_full.sql on Supabase

-- ---------------------------------------------------------------------------
-- Supabase Auth: link person / user_account to auth.users
-- ---------------------------------------------------------------------------
ALTER TABLE person
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

ALTER TABLE user_account
    DROP COLUMN IF EXISTS password_hash;

ALTER TABLE user_account
    ADD COLUMN IF NOT EXISTS auth_user_id UUID UNIQUE;

CREATE INDEX IF NOT EXISTS idx_person_auth_user_id ON person (auth_user_id)
    WHERE auth_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_account_auth_user_id ON user_account (auth_user_id)
    WHERE auth_user_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Soft delete support
-- ---------------------------------------------------------------------------
ALTER TABLE department        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE semester          ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE person            ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE student           ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE advisor           ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE user_account      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE project           ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE student_group     ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE evaluation        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE submission        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE meeting           ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_department_not_deleted ON department (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_student_not_deleted ON student (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_project_not_deleted ON project (id) WHERE deleted_at IS NULL;

-- ---------------------------------------------------------------------------
-- Submission file metadata & workflow
-- ---------------------------------------------------------------------------
ALTER TABLE submission
    ADD COLUMN IF NOT EXISTS submission_type VARCHAR(50),
    ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'Pending',
    ADD COLUMN IF NOT EXISTS storage_bucket VARCHAR(100),
    ADD COLUMN IF NOT EXISTS file_size BIGINT,
    ADD COLUMN IF NOT EXISTS mime_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS reviewed_by INT REFERENCES advisor (id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

ALTER TABLE submission
    DROP CONSTRAINT IF EXISTS chk_submission_type;

ALTER TABLE submission
    ADD CONSTRAINT chk_submission_type
        CHECK (submission_type IS NULL OR submission_type IN (
            'Proposal', 'ProgressReport', 'FinalReport', 'Presentation', 'Other'
        ));

ALTER TABLE submission
    DROP CONSTRAINT IF EXISTS chk_submission_status;

ALTER TABLE submission
    ADD CONSTRAINT chk_submission_status
        CHECK (status IN ('Pending', 'Approved', 'Rejected', 'RevisionRequired'));

-- ---------------------------------------------------------------------------
-- Meeting workflow
-- ---------------------------------------------------------------------------
ALTER TABLE meeting
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'Scheduled',
    ADD COLUMN IF NOT EXISTS online_link VARCHAR(500),
    ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS rescheduled_from_id INT REFERENCES meeting (id) ON DELETE SET NULL;

ALTER TABLE meeting
    DROP CONSTRAINT IF EXISTS chk_meeting_status;

ALTER TABLE meeting
    ADD CONSTRAINT chk_meeting_status
        CHECK (status IN ('Scheduled', 'Completed', 'Cancelled', 'Rescheduled'));

-- ---------------------------------------------------------------------------
-- Evaluation publishing
-- ---------------------------------------------------------------------------
ALTER TABLE group_evaluation
    ADD COLUMN IF NOT EXISTS comments TEXT,
    ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS attachment_path VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_group_evaluation_published
    ON group_evaluation (group_id, is_published);
