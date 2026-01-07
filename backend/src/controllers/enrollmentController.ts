import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { z } from 'zod';
import { EnrollmentStatus } from '../types.js';

const enrollmentSchema = z.object({
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  status: z.nativeEnum(EnrollmentStatus).optional(),
});

export const createEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = enrollmentSchema.parse(req.body);

    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: data.studentId,
        courseId: data.courseId,
        status: data.status || EnrollmentStatus.PENDING,
      },
      include: {
        student: true,
        course: true,
      },
    });

    res.status(201).json(enrollment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateEnrollmentStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = z
      .object({ status: z.nativeEnum(EnrollmentStatus) })
      .parse(req.body);

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: { status },
      include: {
        student: true,
        course: true,
      },
    });

    res.json(enrollment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Update enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteEnrollment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.enrollment.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete enrollment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

