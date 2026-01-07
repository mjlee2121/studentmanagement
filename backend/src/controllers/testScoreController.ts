import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { z } from 'zod';
import { TestTypeEnum } from '../types.js';

const testScoreSchema = z.object({
  studentId: z.string().uuid(),
  testType: z.nativeEnum(TestTypeEnum),
  score: z.number().min(0),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

export const createTestScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = testScoreSchema.parse(req.body);

    const testScore = await prisma.testScore.create({
      data: {
        studentId: data.studentId,
        testType: data.testType,
        score: data.score,
        date: new Date(data.date),
        notes: data.notes,
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

    res.status(201).json(testScore);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create test score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTestScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = testScoreSchema.omit({ studentId: true }).parse(req.body);

    const updateData: any = {};
    if (data.testType) updateData.testType = data.testType;
    if (data.score !== undefined) updateData.score = data.score;
    if (data.date) updateData.date = new Date(data.date);
    if (data.notes !== undefined) updateData.notes = data.notes;

    const testScore = await prisma.testScore.update({
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

    res.json(testScore);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Update test score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTestScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.testScore.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete test score error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

