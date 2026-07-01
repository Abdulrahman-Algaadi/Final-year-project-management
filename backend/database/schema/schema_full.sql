-- Supabase / PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- Final Year Project System - core tables (PostgreSQL / Supabase)
-- Converted from SQL Server with enhanced constraints and referential integrity.

-- ---------------------------------------------------------------------------
-- 1. Department
-- ---------------------------------------------------------------------------
CREATE TABLE department (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    code            VARCHAR(20)  NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_department_name_not_blank
        CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_department_code_not_blank
        CHECK (length(trim(code)) > 0),
    CONSTRAINT chk_department_code_format
        CHECK (code ~ '^[A-Za-z0-9_-]+$'),
    CONSTRAINT uq_department_code UNIQUE (code)
);

-- ---------------------------------------------------------------------------
-- 2. Semester
-- ---------------------------------------------------------------------------
CREATE TABLE semester (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(50)  NOT NULL,
    academic_year   VARCHAR(20)  NOT NULL,
    start_date      DATE,
    end_date        DATE,

    CONSTRAINT chk_semester_name_not_blank
        CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_semester_academic_year_not_blank
        CHECK (length(trim(academic_year)) > 0),
    CONSTRAINT chk_semester_date_range
        CHECK (start_date IS NULL OR end_date IS NULL OR end_date >= start_date)
);

-- ---------------------------------------------------------------------------
-- 8. ProjectStatus (created before Project â€” FK dependency)
-- ---------------------------------------------------------------------------
CREATE TABLE project_status (
    id              SERIAL PRIMARY KEY,
    status_name     VARCHAR(50) NOT NULL,

    CONSTRAINT chk_project_status_name_not_blank
        CHECK (length(trim(status_name)) > 0),
    CONSTRAINT uq_project_status_name UNIQUE (status_name)
);

-- ---------------------------------------------------------------------------
-- 18. Lookup
-- ---------------------------------------------------------------------------
CREATE TABLE lookup (
    id              SERIAL PRIMARY KEY,
    category        VARCHAR(50)  NOT NULL,
    value           VARCHAR(100) NOT NULL,

    CONSTRAINT chk_lookup_category_not_blank
        CHECK (length(trim(category)) > 0),
    CONSTRAINT chk_lookup_value_not_blank
        CHECK (length(trim(value)) > 0),
    CONSTRAINT uq_lookup_category_value UNIQUE (category, value)
);

-- ---------------------------------------------------------------------------
-- 3. Person
-- ---------------------------------------------------------------------------
CREATE TABLE person (
    id              SERIAL PRIMARY KEY,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    gender_id       INT REFERENCES lookup (id) ON DELETE SET NULL,
    date_of_birth   DATE,
    contact_no      VARCHAR(20),
    email           CITEXT UNIQUE,
    address         VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_person_name_present
        CHECK (
            length(trim(coalesce(first_name, ''))) > 0
            OR length(trim(coalesce(last_name, ''))) > 0
        ),
    CONSTRAINT chk_person_email_format
        CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_person_contact_format
        CHECK (contact_no IS NULL OR contact_no ~ '^[0-9+\-() ]{7,20}$'),
    CONSTRAINT chk_person_date_of_birth
        CHECK (date_of_birth IS NULL OR date_of_birth <= CURRENT_DATE)
);

-- ---------------------------------------------------------------------------
-- 4. Student
-- ---------------------------------------------------------------------------
CREATE TABLE student (
    id                  INT PRIMARY KEY REFERENCES person (id) ON DELETE CASCADE,
    registration_no     VARCHAR(30) NOT NULL,
    department_id       INT NOT NULL REFERENCES department (id) ON DELETE RESTRICT,
    semester_id         INT NOT NULL REFERENCES semester (id) ON DELETE RESTRICT,
    enrollment_year     INT NOT NULL,

    CONSTRAINT uq_student_registration_no UNIQUE (registration_no),
    CONSTRAINT chk_student_registration_no_not_blank
        CHECK (length(trim(registration_no)) > 0),
    CONSTRAINT chk_student_enrollment_year
        CHECK (enrollment_year BETWEEN 1990 AND EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1)
);

-- ---------------------------------------------------------------------------
-- 5. Advisor
-- ---------------------------------------------------------------------------
CREATE TABLE advisor (
    id                  INT PRIMARY KEY REFERENCES person (id) ON DELETE CASCADE,
    department_id       INT NOT NULL REFERENCES department (id) ON DELETE RESTRICT,
    designation_id      INT NOT NULL REFERENCES lookup (id) ON DELETE RESTRICT,
    salary              NUMERIC(10, 2),

    CONSTRAINT chk_advisor_salary_non_negative
        CHECK (salary IS NULL OR salary >= 0)
);

-- ---------------------------------------------------------------------------
-- 6. UserAccount
-- ---------------------------------------------------------------------------
CREATE TABLE user_account (
    id              SERIAL PRIMARY KEY,
    person_id       INT NOT NULL UNIQUE REFERENCES person (id) ON DELETE CASCADE,
    username        VARCHAR(50) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL,
    last_login      TIMESTAMPTZ,

    CONSTRAINT uq_user_account_username UNIQUE (username),
    CONSTRAINT chk_user_account_username_not_blank
        CHECK (length(trim(username)) >= 3),
    CONSTRAINT chk_user_account_username_format
        CHECK (username ~ '^[A-Za-z0-9._-]+$'),
    CONSTRAINT chk_user_account_password_hash_not_blank
        CHECK (length(trim(password_hash)) > 0),
    CONSTRAINT chk_user_account_role
        CHECK (role IN ('Admin', 'Advisor', 'Student', 'Coordinator'))
);

-- ---------------------------------------------------------------------------
-- 7. Project
-- ---------------------------------------------------------------------------
CREATE TABLE project (
    id              SERIAL PRIMARY KEY,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    semester_id     INT NOT NULL REFERENCES semester (id) ON DELETE RESTRICT,
    status_id       INT NOT NULL REFERENCES project_status (id) ON DELETE RESTRICT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_project_title_not_blank
        CHECK (length(trim(title)) > 0)
);

-- ---------------------------------------------------------------------------
-- 9. StudentGroup
-- ---------------------------------------------------------------------------
CREATE TABLE student_group (
    id              SERIAL PRIMARY KEY,
    group_name      VARCHAR(100) NOT NULL,
    created_on      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_student_group_name_not_blank
        CHECK (length(trim(group_name)) > 0)
);

-- ---------------------------------------------------------------------------
-- 10. GroupStudent
-- ---------------------------------------------------------------------------
CREATE TABLE group_student (
    id                  SERIAL PRIMARY KEY,
    group_id            INT NOT NULL REFERENCES student_group (id) ON DELETE CASCADE,
    student_id          INT NOT NULL REFERENCES student (id) ON DELETE CASCADE,
    is_leader           BOOLEAN NOT NULL DEFAULT FALSE,
    status_id           INT NOT NULL REFERENCES lookup (id) ON DELETE RESTRICT,
    assignment_date     DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT uq_group_student_group_student UNIQUE (group_id, student_id),
    CONSTRAINT chk_group_student_assignment_date
        CHECK (assignment_date <= CURRENT_DATE)
);

-- ---------------------------------------------------------------------------
-- 11. GroupProject
-- ---------------------------------------------------------------------------
CREATE TABLE group_project (
    id              SERIAL PRIMARY KEY,
    group_id        INT NOT NULL REFERENCES student_group (id) ON DELETE CASCADE,
    project_id      INT NOT NULL REFERENCES project (id) ON DELETE CASCADE,
    assigned_date   DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT uq_group_project_group UNIQUE (group_id),
    CONSTRAINT uq_group_project_project UNIQUE (project_id),
    CONSTRAINT chk_group_project_assigned_date
        CHECK (assigned_date <= CURRENT_DATE)
);

-- ---------------------------------------------------------------------------
-- 12. ProjectAdvisor
-- ---------------------------------------------------------------------------
CREATE TABLE project_advisor (
    id                  SERIAL PRIMARY KEY,
    advisor_id          INT NOT NULL REFERENCES advisor (id) ON DELETE CASCADE,
    project_id          INT NOT NULL REFERENCES project (id) ON DELETE CASCADE,
    advisor_role_id     INT NOT NULL REFERENCES lookup (id) ON DELETE RESTRICT,
    assignment_date     DATE NOT NULL DEFAULT CURRENT_DATE,

    CONSTRAINT uq_project_advisor_project_role UNIQUE (project_id, advisor_role_id),
    CONSTRAINT uq_project_advisor_advisor_project UNIQUE (advisor_id, project_id),
    CONSTRAINT chk_project_advisor_assignment_date
        CHECK (assignment_date <= CURRENT_DATE)
);

-- ---------------------------------------------------------------------------
-- 13. Evaluation
-- ---------------------------------------------------------------------------
CREATE TABLE evaluation (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    total_marks     INT NOT NULL,
    weight          NUMERIC(5, 2) NOT NULL,

    CONSTRAINT chk_evaluation_name_not_blank
        CHECK (length(trim(name)) > 0),
    CONSTRAINT chk_evaluation_total_marks_positive
        CHECK (total_marks > 0),
    CONSTRAINT chk_evaluation_weight_range
        CHECK (weight > 0 AND weight <= 100)
);

-- ---------------------------------------------------------------------------
-- 14. GroupEvaluation
-- ---------------------------------------------------------------------------
CREATE TABLE group_evaluation (
    id                  SERIAL PRIMARY KEY,
    group_id            INT NOT NULL REFERENCES student_group (id) ON DELETE CASCADE,
    evaluation_id       INT NOT NULL REFERENCES evaluation (id) ON DELETE RESTRICT,
    obtained_marks      NUMERIC(5, 2) NOT NULL,
    evaluation_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    evaluated_by        INT NOT NULL REFERENCES advisor (id) ON DELETE RESTRICT,

    CONSTRAINT uq_group_evaluation_group_eval UNIQUE (group_id, evaluation_id),
    CONSTRAINT chk_group_evaluation_marks_non_negative
        CHECK (obtained_marks >= 0),
    CONSTRAINT chk_group_evaluation_date
        CHECK (evaluation_date <= CURRENT_DATE)
);

-- ---------------------------------------------------------------------------
-- 15. Submission
-- ---------------------------------------------------------------------------
CREATE TABLE submission (
    id              SERIAL PRIMARY KEY,
    group_id        INT NOT NULL REFERENCES student_group (id) ON DELETE CASCADE,
    title           VARCHAR(150) NOT NULL,
    file_path       VARCHAR(500) NOT NULL,
    version_no      INT NOT NULL DEFAULT 1,
    submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_submission_title_not_blank
        CHECK (length(trim(title)) > 0),
    CONSTRAINT chk_submission_file_path_not_blank
        CHECK (length(trim(file_path)) > 0),
    CONSTRAINT chk_submission_version_positive
        CHECK (version_no > 0),
    CONSTRAINT uq_submission_group_version UNIQUE (group_id, version_no)
);

-- ---------------------------------------------------------------------------
-- 16. Meeting
-- ---------------------------------------------------------------------------
CREATE TABLE meeting (
    id              SERIAL PRIMARY KEY,
    group_id        INT NOT NULL REFERENCES student_group (id) ON DELETE CASCADE,
    advisor_id      INT NOT NULL REFERENCES advisor (id) ON DELETE RESTRICT,
    meeting_date    TIMESTAMPTZ NOT NULL,
    location        VARCHAR(200),
    notes           TEXT,

    CONSTRAINT chk_meeting_location_not_blank
        CHECK (location IS NULL OR length(trim(location)) > 0)
);

-- ---------------------------------------------------------------------------
-- 17. Notification
-- ---------------------------------------------------------------------------
CREATE TABLE notification (
    id              SERIAL PRIMARY KEY,
    person_id       INT NOT NULL REFERENCES person (id) ON DELETE CASCADE,
    title           VARCHAR(150) NOT NULL,
    message         TEXT NOT NULL,
    is_read         BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_notification_title_not_blank
        CHECK (length(trim(title)) > 0),
    CONSTRAINT chk_notification_message_not_blank
        CHECK (length(trim(message)) > 0)
);

-- ---------------------------------------------------------------------------
-- 19. AuditLog
-- ---------------------------------------------------------------------------
CREATE TABLE audit_log (
    id              SERIAL PRIMARY KEY,
    table_name      VARCHAR(100) NOT NULL,
    record_id       INT NOT NULL,
    action_type     VARCHAR(20) NOT NULL,
    performed_by    INT REFERENCES user_account (id) ON DELETE SET NULL,
    action_date     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_audit_log_table_name_not_blank
        CHECK (length(trim(table_name)) > 0),
    CONSTRAINT chk_audit_log_record_id_positive
        CHECK (record_id > 0),
    CONSTRAINT chk_audit_log_action_type
        CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'))
);
-- Performance indexes for common query patterns and foreign-key lookups.

-- Department
CREATE INDEX idx_department_name ON department (name);
CREATE INDEX idx_department_created_at ON department (created_at DESC);

-- Semester
CREATE INDEX idx_semester_academic_year ON semester (academic_year);
CREATE INDEX idx_semester_date_range ON semester (start_date, end_date);

-- Person
CREATE INDEX idx_person_last_first_name ON person (last_name, first_name);
CREATE INDEX idx_person_gender_id ON person (gender_id) WHERE gender_id IS NOT NULL;
CREATE INDEX idx_person_email_trgm ON person USING gin (email gin_trgm_ops)
    WHERE email IS NOT NULL;

-- Student
CREATE INDEX idx_student_department_id ON student (department_id);
CREATE INDEX idx_student_semester_id ON student (semester_id);
CREATE INDEX idx_student_enrollment_year ON student (enrollment_year);
CREATE INDEX idx_student_department_semester ON student (department_id, semester_id);

-- Advisor
CREATE INDEX idx_advisor_department_id ON advisor (department_id);
CREATE INDEX idx_advisor_designation_id ON advisor (designation_id);

-- UserAccount
CREATE INDEX idx_user_account_role ON user_account (role);
CREATE INDEX idx_user_account_last_login ON user_account (last_login DESC NULLS LAST);

-- Project
CREATE INDEX idx_project_semester_id ON project (semester_id);
CREATE INDEX idx_project_status_id ON project (status_id);
CREATE INDEX idx_project_created_at ON project (created_at DESC);
CREATE INDEX idx_project_title_trgm ON project USING gin (title gin_trgm_ops);

-- StudentGroup
CREATE INDEX idx_student_group_created_on ON student_group (created_on DESC);
CREATE INDEX idx_student_group_name_trgm ON student_group USING gin (group_name gin_trgm_ops);

-- GroupStudent
CREATE INDEX idx_group_student_group_id ON group_student (group_id);
CREATE INDEX idx_group_student_student_id ON group_student (student_id);
CREATE INDEX idx_group_student_status_id ON group_student (status_id);
CREATE UNIQUE INDEX uq_group_student_one_leader
    ON group_student (group_id)
    WHERE is_leader = TRUE;

-- GroupProject
CREATE INDEX idx_group_project_project_id ON group_project (project_id);
CREATE INDEX idx_group_project_assigned_date ON group_project (assigned_date DESC);

-- ProjectAdvisor
CREATE INDEX idx_project_advisor_advisor_id ON project_advisor (advisor_id);
CREATE INDEX idx_project_advisor_project_id ON project_advisor (project_id);
CREATE INDEX idx_project_advisor_role_id ON project_advisor (advisor_role_id);

-- Evaluation
CREATE INDEX idx_evaluation_name ON evaluation (name);

-- GroupEvaluation
CREATE INDEX idx_group_evaluation_group_id ON group_evaluation (group_id);
CREATE INDEX idx_group_evaluation_evaluation_id ON group_evaluation (evaluation_id);
CREATE INDEX idx_group_evaluation_evaluated_by ON group_evaluation (evaluated_by);
CREATE INDEX idx_group_evaluation_date ON group_evaluation (evaluation_date DESC);

-- Submission
CREATE INDEX idx_submission_group_id ON submission (group_id);
CREATE INDEX idx_submission_submitted_at ON submission (submitted_at DESC);

-- Meeting
CREATE INDEX idx_meeting_group_id ON meeting (group_id);
CREATE INDEX idx_meeting_advisor_id ON meeting (advisor_id);
CREATE INDEX idx_meeting_date ON meeting (meeting_date DESC);

-- Notification
CREATE INDEX idx_notification_person_id ON notification (person_id);
CREATE INDEX idx_notification_created_at ON notification (created_at DESC);
CREATE INDEX idx_notification_unread
    ON notification (person_id, created_at DESC)
    WHERE is_read = FALSE;

-- Lookup
CREATE INDEX idx_lookup_category ON lookup (category);

-- AuditLog
CREATE INDEX idx_audit_log_table_record ON audit_log (table_name, record_id);
CREATE INDEX idx_audit_log_performed_by ON audit_log (performed_by) WHERE performed_by IS NOT NULL;
CREATE INDEX idx_audit_log_action_date ON audit_log (action_date DESC);
CREATE INDEX idx_audit_log_action_type ON audit_log (action_type);
-- Enforce lookup category rules for typed foreign keys.

CREATE OR REPLACE FUNCTION fn_lookup_category_matches(
    p_lookup_id INT,
    p_expected_category TEXT
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM lookup
        WHERE id = p_lookup_id
          AND lower(category) = lower(p_expected_category)
    );
$$;

ALTER TABLE person
    ADD CONSTRAINT chk_person_gender_lookup_category
        CHECK (gender_id IS NULL OR fn_lookup_category_matches(gender_id, 'Gender'));

ALTER TABLE advisor
    ADD CONSTRAINT chk_advisor_designation_lookup_category
        CHECK (fn_lookup_category_matches(designation_id, 'Designation'));

ALTER TABLE group_student
    ADD CONSTRAINT chk_group_student_status_lookup_category
        CHECK (fn_lookup_category_matches(status_id, 'StudentStatus'));

ALTER TABLE project_advisor
    ADD CONSTRAINT chk_project_advisor_role_lookup_category
        CHECK (fn_lookup_category_matches(advisor_role_id, 'AdvisorRole'));

-- Cross-table: obtained marks cannot exceed evaluation total
CREATE OR REPLACE FUNCTION fn_validate_group_evaluation_marks()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    v_total_marks INT;
BEGIN
    SELECT total_marks
    INTO v_total_marks
    FROM evaluation
    WHERE id = NEW.evaluation_id;

    IF NEW.obtained_marks > v_total_marks THEN
        RAISE EXCEPTION
            'Obtained marks (%) cannot exceed evaluation total (%)',
            NEW.obtained_marks, v_total_marks;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_group_evaluation_marks_limit
    BEFORE INSERT OR UPDATE OF obtained_marks, evaluation_id
    ON group_evaluation
    FOR EACH ROW
    EXECUTE PROCEDURE fn_validate_group_evaluation_marks();
-- Reference / seed data

INSERT INTO project_status (status_name) VALUES
    ('Pending'),
    ('Approved'),
    ('Rejected'),
    ('Ongoing'),
    ('Completed'),
    ('Archived')
ON CONFLICT (status_name) DO NOTHING;

INSERT INTO lookup (category, value) VALUES
    ('Gender', 'Male'),
    ('Gender', 'Female'),
    ('AdvisorRole', 'Supervisor'),
    ('AdvisorRole', 'Co-Supervisor'),
    ('AdvisorRole', 'External Examiner'),
    ('Designation', 'Professor'),
    ('Designation', 'Associate Professor'),
    ('Designation', 'Assistant Professor'),
    ('Designation', 'Lecturer'),
    ('StudentStatus', 'Active'),
    ('StudentStatus', 'Inactive'),
    ('StudentStatus', 'Graduated')
ON CONFLICT (category, value) DO NOTHING;
