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
