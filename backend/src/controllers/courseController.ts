import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { z } from 'zod';

const courseBaseSchema = z.object({
  name: z.string().min(1, 'Course name is required. Please enter a course name.'),
  code: z.string().min(1, 'Course code is required. Please enter a course code.'),
  description: z.string().optional(),
  startDate: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Please enter a valid start date format (YYYY-MM-DD).'
    ),
  endDate: z
    .string()
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Please enter a valid end date format (YYYY-MM-DD).'
    ),
  instructorId: z
    .string()
    .uuid('Please select a valid instructor.')
    .optional()
    .or(z.literal('')),
});

const courseSchema = courseBaseSchema.refine(
  (data) => {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  },
  {
    message: 'End date must be after the start date.',
    path: ['endDate'],
  }
);

const courseUpdateSchema = courseBaseSchema.partial();

export const getCourses = async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    res.json(courses);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ 
      error: 'Unable to load courses. Please refresh the page or try again later.' 
    });
  }
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true,
        enrollments: {
          include: {
            student: true,
            attendances: {
              orderBy: { date: 'desc' },
            },
          },
        },
      },
    });

    if (!course) {
      res.status(404).json({ error: 'Course not found. The course you are looking for does not exist or may have been deleted.' });
      return;
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ 
      error: 'Unable to load course information. Please refresh the page or try again later.' 
    });
  }
};

export const createCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = courseSchema.parse(req.body);

    const course = await prisma.course.create({
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        instructorId: data.instructorId,
      },
    });

    res.status(201).json(course);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => {
        const field = err.path.join('.');
        return `• ${field ? `${field}: ` : ''}${err.message}`;
      });
      res.status(400).json({ 
        error: `Please fix the following errors:\n${errorMessages.join('\n')}`,
        details: error.errors,
        fieldErrors: error.errors.reduce((acc: any, err) => {
          acc[err.path.join('.')] = err.message;
          return acc;
        }, {})
      });
      return;
    }
    if ((error as any).code === 'P2002') {
      res.status(409).json({ error: 'A course with this code already exists. Please use a different course code.' });
      return;
    }
    console.error('Create course error:', error);
    res.status(500).json({ 
      error: 'Unable to create course at this time. Please try again later or contact support if the problem persists.' 
    });
  }
};

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = courseUpdateSchema.parse(req.body);

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.code) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.instructorId !== undefined) updateData.instructorId = data.instructorId;

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
    });

    res.json(course);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => {
        const field = err.path.join('.');
        return `• ${field ? `${field}: ` : ''}${err.message}`;
      });
      res.status(400).json({ 
        error: `Please fix the following errors:\n${errorMessages.join('\n')}`,
        details: error.errors 
      });
      return;
    }
    if ((error as any).code === 'P2025') {
      res.status(404).json({ error: 'Course not found. The course you are trying to update does not exist.' });
      return;
    }
    console.error('Update course error:', error);
    res.status(500).json({ 
      error: 'Unable to update course at this time. Please try again later or contact support if the problem persists.' 
    });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.course.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    if ((error as any).code === 'P2025') {
      res.status(404).json({ error: 'Course not found. The course you are trying to delete does not exist.' });
      return;
    }
    console.error('Delete course error:', error);
    res.status(500).json({ 
      error: 'Unable to delete course at this time. Please try again later or contact support if the problem persists.' 
    });
  }
};

