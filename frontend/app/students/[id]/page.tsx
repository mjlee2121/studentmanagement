'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { Student } from '@/lib/types';
import { format } from 'date-fns';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'progress' | 'notes'>('profile');

  useEffect(() => {
    if (params.id) {
      fetchStudent();
    }
  }, [params.id]);

  const fetchStudent = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/students/${params.id}`);
      setStudent(response.data);
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="px-4 py-6">Loading...</div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="px-4 py-6">Student not found</div>
      </Layout>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'attendance', label: 'Attendance' },
    { id: 'progress', label: 'Progress' },
    { id: 'notes', label: 'Notes' },
  ] as const;

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-primary-600 hover:text-primary-800 mb-4"
          >
            ← Back to Students
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {student.firstName} {student.lastName}
          </h2>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900">{student.email || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="mt-1 text-sm text-gray-900">{student.phone || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {student.dateOfBirth ? format(new Date(student.dateOfBirth), 'PPP') : '-'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Admission Process</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={student.passportCollected}
                        disabled
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900">Passport Collected</span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={student.applicationFormCollected}
                        disabled
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900">Application Form Collected</span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={student.highschoolTranscriptCollected}
                        disabled
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900">High School Transcript Collected</span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={student.collegeTranscriptCollected}
                        disabled
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900">College Transcript Collected</span>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Desired Admission Term</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {student.desiredAdmissionTerm || '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Major</dt>
                      <dd className="mt-1 text-sm text-gray-900">{student.major || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Desired Universities</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {student.desiredUniversities?.length > 0
                          ? student.desiredUniversities.join(', ')
                          : '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Homestay Address</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {student.homestayAddress || '-'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Boston Arrival Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {student.bostonArrivalDate
                          ? format(new Date(student.bostonArrivalDate), 'PPP')
                          : '-'}
                      </dd>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={student.shorelightApplication}
                        disabled
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900">Shorelight Application</span>
                    </div>
                    {student.shorelightApplication && student.shorelightUniversities?.length > 0 && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Shorelight Universities</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {student.shorelightUniversities.join(', ')}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Enrolled Courses</h3>
                  {student.enrollments && student.enrollments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="table-header">Course</th>
                            <th className="table-header">Status</th>
                            <th className="table-header">Enrolled Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {student.enrollments.map((enrollment) => (
                            <tr key={enrollment.id}>
                              <td className="table-cell">
                                {enrollment.course?.name} ({enrollment.course?.code})
                              </td>
                              <td className="table-cell">
                                <span
                                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    enrollment.status === 'ENROLLED'
                                      ? 'bg-green-100 text-green-800'
                                      : enrollment.status === 'COMPLETED'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {enrollment.status}
                                </span>
                              </td>
                              <td className="table-cell">
                                {format(new Date(enrollment.enrolledAt), 'PPP')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No enrolled courses</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Invoices</h3>
                  {student.invoices && student.invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="table-header">Invoice #</th>
                            <th className="table-header">Service Type</th>
                            <th className="table-header">Amount</th>
                            <th className="table-header">Paid</th>
                            <th className="table-header">Due Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {student.invoices.map((invoice) => (
                            <tr key={invoice.id}>
                              <td className="table-cell">{invoice.invoiceNumber}</td>
                              <td className="table-cell">{invoice.serviceType}</td>
                              <td className="table-cell">${invoice.amount.toFixed(2)}</td>
                              <td className="table-cell">${invoice.paidAmount.toFixed(2)}</td>
                              <td className="table-cell">
                                {invoice.dueDate ? format(new Date(invoice.dueDate), 'PPP') : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No invoices</p>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">After Graduation</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={student.stage2Services}
                        disabled
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-900">Stage 2 Services</span>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Expected Graduation Date</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {student.expectedGraduationDate
                          ? format(new Date(student.expectedGraduationDate), 'PPP')
                          : '-'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Records</h3>
                {student.enrollments && student.enrollments.length > 0 ? (
                  student.enrollments.map((enrollment) => (
                    <div key={enrollment.id} className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {enrollment.course?.name} ({enrollment.course?.code})
                      </h4>
                      {enrollment.attendances && enrollment.attendances.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="table-header">Date</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Notes</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {enrollment.attendances.map((attendance) => (
                                <tr key={attendance.id}>
                                  <td className="table-cell">
                                    {format(new Date(attendance.date), 'PPP')}
                                  </td>
                                  <td className="table-cell">
                                    {attendance.present ? (
                                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                        Present
                                      </span>
                                    ) : (
                                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                        Absent
                                      </span>
                                    )}
                                  </td>
                                  <td className="table-cell">{attendance.notes || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No attendance records</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No enrolled courses</p>
                )}
              </div>
            )}

            {activeTab === 'progress' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Test Scores</h3>
                {student.testScores && student.testScores.length > 0 ? (
                  <div className="overflow-x-auto mb-6">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="table-header">Test Type</th>
                          <th className="table-header">Score</th>
                          <th className="table-header">Date</th>
                          <th className="table-header">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {student.testScores.map((test) => (
                          <tr key={test.id}>
                            <td className="table-cell">{test.testType}</td>
                            <td className="table-cell font-medium">{test.score}</td>
                            <td className="table-cell">
                              {format(new Date(test.date), 'PPP')}
                            </td>
                            <td className="table-cell">{test.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-6">No test scores</p>
                )}

                <h3 className="text-lg font-medium text-gray-900 mb-4">Progress Reports</h3>
                {student.progressReports && student.progressReports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="table-header">Date</th>
                          <th className="table-header">Reading</th>
                          <th className="table-header">Listening</th>
                          <th className="table-header">Speaking</th>
                          <th className="table-header">Writing</th>
                          <th className="table-header">Comments</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {student.progressReports.map((report) => (
                          <tr key={report.id}>
                            <td className="table-cell">
                              {format(new Date(report.date), 'PPP')}
                            </td>
                            <td className="table-cell">{report.reading ?? '-'}</td>
                            <td className="table-cell">{report.listening ?? '-'}</td>
                            <td className="table-cell">{report.speaking ?? '-'}</td>
                            <td className="table-cell">{report.writing ?? '-'}</td>
                            <td className="table-cell">{report.comments || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No progress reports</p>
                )}
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
                {student.notes && student.notes.length > 0 ? (
                  <div className="space-y-4">
                    {student.notes.map((note) => (
                      <div key={note.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {note.createdBy?.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(note.createdAt), 'PPP p')}
                            </p>
                          </div>
                          {note.isInternal && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Internal
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No notes</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

