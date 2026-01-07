export enum UserRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STAFF = 'STAFF',
}

export enum EnrollmentStatus {
  ENROLLED = 'ENROLLED',
  COMPLETED = 'COMPLETED',
  DROPPED = 'DROPPED',
  PENDING = 'PENDING',
}

export enum TestTypeEnum {
  TOEFL = 'TOEFL',
  DUOLINGO = 'DUOLINGO',
}

export enum ServiceType {
  CAREER_COACHING = 'CAREER_COACHING',
  ACADEMIC_COACHING = 'ACADEMIC_COACHING',
  LIFE_SUPPORT = 'LIFE_SUPPORT',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
  // Admission Process
  passportCollected: boolean;
  applicationFormCollected: boolean;
  highschoolTranscriptCollected: boolean;
  collegeTranscriptCollected: boolean;
  desiredAdmissionTerm?: string;
  desiredUniversities: string[];
  major?: string;
  homestayAddress?: string;
  bostonArrivalDate?: string;
  shorelightApplication: boolean;
  shorelightUniversities: string[];
  // After Graduation
  stage2Services: boolean;
  expectedGraduationDate?: string;
  // Relations
  enrollments?: Enrollment[];
  attendances?: Attendance[];
  progressReports?: ProgressReport[];
  testScores?: TestScore[];
  invoices?: Invoice[];
  notes?: Note[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  startDate: string;
  endDate: string;
  instructorId?: string;
  instructor?: User;
  enrollments?: Enrollment[];
}

export interface Enrollment {
  id: string;
  status: EnrollmentStatus;
  enrolledAt: string;
  studentId: string;
  courseId: string;
  student?: Student;
  course?: Course;
  attendances?: Attendance[];
}

export interface Attendance {
  id: string;
  date: string;
  present: boolean;
  notes?: string;
  enrollmentId: string;
  enrollment?: Enrollment;
}

export interface ProgressReport {
  id: string;
  date: string;
  reading?: number;
  listening?: number;
  speaking?: number;
  writing?: number;
  comments?: string;
  studentId: string;
  student?: Student;
}

export interface TestScore {
  id: string;
  testType: TestTypeEnum;
  score: number;
  date: string;
  notes?: string;
  studentId: string;
  student?: Student;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  serviceType: ServiceType;
  amount: number;
  paidAmount: number;
  dueDate?: string;
  paidDate?: string;
  notes?: string;
  studentId: string;
  student?: Student;
}

export interface Note {
  id: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  createdById: string;
  createdBy?: User;
}

