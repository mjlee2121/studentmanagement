import { UserRole, EnrollmentStatus, TestTypeEnum, ServiceType } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export { UserRole, EnrollmentStatus, TestTypeEnum, ServiceType };

