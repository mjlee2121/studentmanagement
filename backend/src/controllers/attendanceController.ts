import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { z } from 'zod';

const attendanceSchema = z.object({
  enrollmentId: z.string().uuid(),
  date: z.string().datetime(),
  present: z.boolean(),
  notes: z.string().optional(),
});

export const createAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = attendanceSchema.parse(req.body);

    const attendance = await prisma.attendance.create({
      data: {
        enrollmentId: data.enrollmentId,
        date: new Date(data.date),
        present: data.present,
        notes: data.notes,
      },
      include: {
        enrollment: {
          include: {
            student: true,
            course: true,
          },
        },
      },
    });

    res.status(201).json(attendance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = attendanceSchema.partial().parse(req.body);

    const updateData: any = {};
    if (data.date) updateData.date = new Date(data.date);
    if (data.present !== undefined) updateData.present = data.present;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const attendance = await prisma.attendance.update({
      where: { id },
      data: updateData,
      include: {
        enrollment: {
          include: {
            student: true,
            course: true,
          },
        },
      },
    });

    res.json(attendance);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAttendance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.attendance.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

