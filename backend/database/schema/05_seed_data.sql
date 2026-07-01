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
