import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { z } from 'zod';
import { UserRole } from '../types.js';

const studentCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  // Admission fields
  passportCollected: z.boolean().optional(),
  applicationFormCollected: z.boolean().optional(),
  highschoolTranscriptCollected: z.boolean().optional(),
  collegeTranscriptCollected: z.boolean().optional(),
  desiredAdmissionTerm: z.string().optional(),
  desiredUniversities: z.array(z.string()).optional(),
  major: z.string().optional(),
  homestayAddress: z.string().optional(),
  bostonArrivalDate: z.string().datetime().optional(),
  shorelightApplication: z.boolean().optional(),
  shorelightUniversities: z.array(z.string()).optional(),
  // Graduation fields
  stage2Services: z.boolean().optional(),
  expectedGraduationDate: z.string().datetime().optional(),
});

const studentUpdateSchema = studentCreateSchema.partial();

export const getStudents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      admissionTerm,
      desiredUniversity,
      stage2Services,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (admissionTerm) {
      where.desiredAdmissionTerm = admissionTerm;
    }

    if (desiredUniversity) {
      where.desiredUniversities = { has: desiredUniversity as string };
    }

    if (stage2Services !== undefined) {
      where.stage2Services = stage2Services === 'true';
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          enrollments: {
            include: {
              course: true,
            },
          },
        },
      }),
      prisma.student.count({ where }),
    ]);

    res.json({
      students,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            attendances: {
              orderBy: { date: 'desc' },
            },
          },
        },
        progressReports: {
          orderBy: { date: 'desc' },
        },
        testScores: {
          orderBy: { date: 'desc' },
        },
        invoices: {
          orderBy: { createdAt: 'desc' },
        },
        notes: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!student) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Filter notes based on user role
    if (req.user?.role !== UserRole.ADMIN && req.user?.role !== UserRole.STAFF) {
      student.notes = student.notes.filter((note) => !note.isInternal);
    }

    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = studentCreateSchema.parse(req.body);

    const studentData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      passportCollected: data.passportCollected ?? false,
      applicationFormCollected: data.applicationFormCollected ?? false,
      highschoolTranscriptCollected: data.highschoolTranscriptCollected ?? false,
      collegeTranscriptCollected: data.collegeTranscriptCollected ?? false,
      desiredAdmissionTerm: data.desiredAdmissionTerm,
      desiredUniversities: data.desiredUniversities ?? [],
      major: data.major,
      homestayAddress: data.homestayAddress,
      bostonArrivalDate: data.bostonArrivalDate ? new Date(data.bostonArrivalDate) : undefined,
      shorelightApplication: data.shorelightApplication ?? false,
      shorelightUniversities: data.shorelightUniversities ?? [],
      stage2Services: data.stage2Services ?? false,
      expectedGraduationDate: data.expectedGraduationDate
        ? new Date(data.expectedGraduationDate)
        : undefined,
    };

    const student = await prisma.student.create({
      data: studentData,
    });

    res.status(201).json(student);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = studentUpdateSchema.parse(req.body);

    const updateData: any = {};

    if (data.firstName) updateData.firstName = data.firstName;
    if (data.lastName) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.dateOfBirth) updateData.dateOfBirth = new Date(data.dateOfBirth);
    if (data.passportCollected !== undefined) updateData.passportCollected = data.passportCollected;
    if (data.applicationFormCollected !== undefined)
      updateData.applicationFormCollected = data.applicationFormCollected;
    if (data.highschoolTranscriptCollected !== undefined)
      updateData.highschoolTranscriptCollected = data.highschoolTranscriptCollected;
    if (data.collegeTranscriptCollected !== undefined)
      updateData.collegeTranscriptCollected = data.collegeTranscriptCollected;
    if (data.desiredAdmissionTerm !== undefined)
      updateData.desiredAdmissionTerm = data.desiredAdmissionTerm;
    if (data.desiredUniversities !== undefined)
      updateData.desiredUniversities = data.desiredUniversities;
    if (data.major !== undefined) updateData.major = data.major;
    if (data.homestayAddress !== undefined) updateData.homestayAddress = data.homestayAddress;
    if (data.bostonArrivalDate)
      updateData.bostonArrivalDate = new Date(data.bostonArrivalDate);
    if (data.shorelightApplication !== undefined)
      updateData.shorelightApplication = data.shorelightApplication;
    if (data.shorelightUniversities !== undefined)
      updateData.shorelightUniversities = data.shorelightUniversities;
    if (data.stage2Services !== undefined) updateData.stage2Services = data.stage2Services;
    if (data.expectedGraduationDate)
      updateData.expectedGraduationDate = new Date(data.expectedGraduationDate);

    const student = await prisma.student.update({
      where: { id },
      data: updateData,
    });

    res.json(student);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.student.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

