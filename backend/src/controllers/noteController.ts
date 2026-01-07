import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { z } from 'zod';

const noteSchema = z.object({
  studentId: z.string().uuid(),
  content: z.string().min(1),
  isInternal: z.boolean().optional(),
});

export const createNote = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const data = noteSchema.parse(req.body);

    const note = await prisma.note.create({
      data: {
        studentId: data.studentId,
        content: data.content,
        isInternal: data.isInternal ?? true,
        createdById: req.user.userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    res.status(201).json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = noteSchema.omit({ studentId: true }).parse(req.body);

    const note = await prisma.note.update({
      where: { id },
      data: {
        content: data.content,
        isInternal: data.isInternal,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(note);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteNote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.note.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

