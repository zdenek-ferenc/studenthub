
export type AcademicRequestStatus = 'open' | 'matched' | 'closed';

export interface AcademicRequest {
    id: string;
    professor_id: string;
    subject_name: string;
    student_count: number;
    description: string;
    semester: string;
    status: AcademicRequestStatus;
    join_code: string;
    created_at?: string;
}
