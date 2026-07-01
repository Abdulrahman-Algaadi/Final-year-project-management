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
