import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { z } from 'zod';

const progressReportSchema = z.object({
  studentId: z.string().uuid(),
  date: z.string().datetime().optional(),
  reading: z.number().min(0).max(100).optional(),
  listening: z.number().min(0).max(100).optional(),
  speaking: z.number().min(0).max(100).optional(),
  writing: z.number().min(0).max(100).optional(),
  comments: z.string().optional(),
});

export const createProgressReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = progressReportSchema.parse(req.body);

    const report = await prisma.progressReport.create({
      data: {
        studentId: data.studentId,
        date: data.date ? new Date(data.date) : new Date(),
        reading: data.reading,
        listening: data.listening,
        speaking: data.speaking,
        writing: data.writing,
        comments: data.comments,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create progress report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProgressReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = progressReportSchema.omit({ studentId: true }).parse(req.body);

    const updateData: any = {};
    if (data.date) updateData.date = new Date(data.date);
    if (data.reading !== undefined) updateData.reading = data.reading;
    if (data.listening !== undefined) updateData.listening = data.listening;
    if (data.speaking !== undefined) updateData.speaking = data.speaking;
    if (data.writing !== undefined) updateData.writing = data.writing;
    if (data.comments !== undefined) updateData.comments = data.comments;

    const report = await prisma.progressReport.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.json(report);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Update progress report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProgressReport = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.progressReport.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete progress report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

