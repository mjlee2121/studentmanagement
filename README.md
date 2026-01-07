# Student Management System

A production-ready student management web application for an English education institution providing college admission consulting services.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with role-based access control

## Project Structure

```
studentmanagement/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth middleware
│   │   ├── routes/         # API routes
│   │   ├── prisma.ts       # Prisma client
│   │   ├── types.ts        # TypeScript types
│   │   └── server.ts       # Express server
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── scripts/
│       └── seed.ts         # Database seeding script
└── frontend/
    ├── app/                # Next.js app directory
    ├── components/         # React components
    └── lib/                # Utilities and API client
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string for JWT signing
- `PORT`: Backend server port (default: 3001)

4. Generate Prisma client:
```bash
npm run db:generate
```

5. Run database migrations:
```bash
npm run db:push
```

6. Seed initial data (optional):
```bash
npx tsx scripts/seed.ts
```

This creates three test users:
- Admin: `admin@example.com` / `admin123`
- Instructor: `instructor@example.com` / `instructor123`
- Staff: `staff@example.com` / `staff123`

7. Start the backend server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and update:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:3001/api`)

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Features

### User Roles & Permissions

- **Admin**: Full access to all features
- **Instructor**: View assigned students, update attendance & feedback
- **Staff**: Manage enrollment, documents, and progress reports

### Student Management

1. **Admission Process**:
   - Document checklist (passport, application form, transcripts)
   - Desired admission term and universities
   - Major selection
   - Homestay information
   - Boston arrival date
   - Shorelight application tracking

2. **After Enrollment**:
   - Academic progress tracking
   - Test preparation (TOEFL/Duolingo)
   - University courses and credits

3. **After Graduation**:
   - Stage 2 services tracking
   - Expected graduation date

### Course Management

- Course creation and management
- Instructor assignment
- Student enrollment tracking

### Attendance Tracking

- Per-course attendance records
- Date-based tracking
- Notes and comments

### Academic Progress

- Reading, Listening, Speaking, Writing scores
- Progress reports with comments
- Test score tracking

### Additional Features

- Customizable invoice creation
- Internal notes (staff-only)
- Search and filter students
- Pagination support

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - List students (with filters)
- `GET /api/students/:id` - Get student details
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Enrollments
- `POST /api/enrollments` - Create enrollment
- `PUT /api/enrollments/:id/status` - Update enrollment status
- `DELETE /api/enrollments/:id` - Delete enrollment

### Attendance
- `POST /api/attendances` - Create attendance record
- `PUT /api/attendances/:id` - Update attendance
- `DELETE /api/attendances/:id` - Delete attendance

### Progress Reports
- `POST /api/progress-reports` - Create progress report
- `PUT /api/progress-reports/:id` - Update progress report
- `DELETE /api/progress-reports/:id` - Delete progress report

### Test Scores
- `POST /api/test-scores` - Create test score
- `PUT /api/test-scores/:id` - Update test score
- `DELETE /api/test-scores/:id` - Delete test score

### Invoices
- `POST /api/invoices` - Create invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice

### Notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## Development

### Running Both Frontend and Backend

From the root directory:
```bash
npm install
npm run dev
```

This will start both servers concurrently.

### Database Management

- View database: `npm run db:studio`
- Generate Prisma client: `npm run db:generate`
- Push schema changes: `npm run db:push`

## Deployment

### Backend (AWS)

1. Build the backend:
```bash
cd backend
npm run build
```

2. Deploy to your preferred AWS service (EC2, ECS, Lambda, etc.)
3. Ensure environment variables are set
4. Run migrations on the production database

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## License

Proprietary - All rights reserved

