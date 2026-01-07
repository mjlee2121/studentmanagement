import { Request, Response } from 'express';
import prisma from '../prisma.js';
import { z } from 'zod';
import { ServiceType } from '../types.js';

const invoiceSchema = z.object({
  studentId: z.string().uuid(),
  invoiceNumber: z.string().min(1),
  serviceType: z.nativeEnum(ServiceType),
  amount: z.number().positive(),
  paidAmount: z.number().min(0).optional(),
  dueDate: z.string().datetime().optional(),
  paidDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export const createInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = invoiceSchema.parse(req.body);

    const invoice = await prisma.invoice.create({
      data: {
        studentId: data.studentId,
        invoiceNumber: data.invoiceNumber,
        serviceType: data.serviceType,
        amount: data.amount,
        paidAmount: data.paidAmount ?? 0,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        paidDate: data.paidDate ? new Date(data.paidDate) : undefined,
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

    res.status(201).json(invoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Create invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = invoiceSchema.omit({ studentId: true }).partial().parse(req.body);

    const updateData: any = {};
    if (data.invoiceNumber) updateData.invoiceNumber = data.invoiceNumber;
    if (data.serviceType) updateData.serviceType = data.serviceType;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.paidAmount !== undefined) updateData.paidAmount = data.paidAmount;
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.paidDate) updateData.paidDate = new Date(data.paidDate);
    if (data.notes !== undefined) updateData.notes = data.notes;

    const invoice = await prisma.invoice.update({
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

    res.json(invoice);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await prisma.invoice.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

