'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { Student } from '@/lib/types';
import { Search, Plus, Eye, List, Grid, Mail, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [admissionTerm, setAdmissionTerm] = useState('');
  const [desiredUniversity, setDesiredUniversity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStudents();
  }, [page, search, admissionTerm, desiredUniversity]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (search) params.search = search;
      if (admissionTerm) params.admissionTerm = admissionTerm;
      if (desiredUniversity) params.desiredUniversity = desiredUniversity;

      const response = await api.get('/students', { params });
      setStudents(response.data.students);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const toggleCardExpansion = (studentId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const getApplicationMetrics = (student: Student) => {
    const enrollments = student.enrollments?.filter(e => e.status === 'ENROLLED' || e.status === 'PENDING') || [];
    const applications = enrollments.length;
    const depositsPaid = student.invoices?.filter(inv => inv.paidAmount > 0).length || 0;
    // Placeholder for offer letters and I-20 - can be enhanced later
    const conditionalOffers = 0;
    const i20Issued = 0;

    return {
      applications,
      conditionalOffers,
      depositsPaid,
      i20Issued,
      hasInProgress: applications > 0 && depositsPaid === 0,
    };
  };

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Students</h2>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded ${viewMode === 'card' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
                title="Card View"
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>
            <Link href="/students/new" className="btn-primary inline-flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Student
            </Link>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg mb-6">
          <form onSubmit={handleSearch} className="p-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="input-field pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <input
                type="text"
                placeholder="Admission Term"
                className="input-field"
                value={admissionTerm}
                onChange={(e) => setAdmissionTerm(e.target.value)}
              />
              <input
                type="text"
                placeholder="Desired University"
                className="input-field"
                value={desiredUniversity}
                onChange={(e) => setDesiredUniversity(e.target.value)}
              />
              <button type="submit" className="btn-primary">
                Filter
              </button>
            </div>
          </form>

          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Admission Term</th>
                    <th className="table-header">Desired Universities</th>
                    <th className="table-header">Stage 2 Services</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="table-cell text-center">
                        Loading...
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="table-cell text-center">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="table-cell font-medium">
                          {student.firstName} {student.lastName}
                        </td>
                        <td className="table-cell">{student.email || '-'}</td>
                        <td className="table-cell">{student.desiredAdmissionTerm || '-'}</td>
                        <td className="table-cell">
                          {student.desiredUniversities?.join(', ') || '-'}
                        </td>
                        <td className="table-cell">
                          {student.stage2Services ? (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Yes
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </td>
                        <td className="table-cell">
                          <Link
                            href={`/students/${student.id}`}
                            className="text-primary-600 hover:text-primary-900 inline-flex items-center"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
              ) : students.length === 0 ? (
                <div className="text-center py-12 text-gray-500">No students found</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {students.map((student) => {
                    const metrics = getApplicationMetrics(student);
                    const isExpanded = expandedCards.has(student.id);
                    const hasInProgress = metrics.hasInProgress;

                    return (
                      <div
                        key={student.id}
                        className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                          hasInProgress ? 'border-red-300' : 'border-gray-200'
                        }`}
                      >
                        <div className="p-5">
                          {/* Last Updated */}
                          <div className="text-xs text-gray-500 mb-3">
                            Last updated: {format(new Date(student.updatedAt), 'EEE, d MMM yyyy')}
                          </div>

                          {/* Name and Email */}
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {student.firstName} {student.lastName}
                            </h3>
                            {student.email && (
                              <a
                                href={`mailto:${student.email}`}
                                className="text-gray-400 hover:text-primary-600"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail className="w-5 h-5" />
                              </a>
                            )}
                          </div>

                          {/* Birth Date */}
                          {student.dateOfBirth && (
                            <div className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Birth Date:</span>{' '}
                              {format(new Date(student.dateOfBirth), 'd MMM yyyy')}
                            </div>
                          )}

                          {/* Counselor - Placeholder */}
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-medium">Counselor(s):</span> Admission TAHS
                          </div>

                          {/* Branch - Placeholder */}
                          <div className="text-sm text-gray-600 mb-4">
                            <span className="font-medium">Branch:</span> The Academy at Harvard Square
                          </div>

                          {/* Application Status */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div>
                              <div className="text-xs text-gray-500">Applications</div>
                              <div className="text-lg font-semibold text-gray-900">{metrics.applications}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Conditional Offer Letters</div>
                              <div className="text-lg font-semibold text-gray-900">{metrics.conditionalOffers}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">Deposits Paid</div>
                              <div className="text-lg font-semibold text-gray-900">{metrics.depositsPaid}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">I-20 Issued</div>
                              <div className="text-lg font-semibold text-gray-900">{metrics.i20Issued}</div>
                            </div>
                          </div>

                          {/* In Progress Message */}
                          {hasInProgress && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm text-red-800">
                                You have an application in progress for {student.desiredUniversities?.[0] || 'university'}
                              </p>
                              <Link
                                href={`/students/${student.id}`}
                                className="mt-2 inline-block px-4 py-2 border border-gray-300 bg-white rounded hover:bg-gray-50 text-sm font-medium"
                              >
                                Continue
                              </Link>
                            </div>
                          )}

                          {/* Expandable Details */}
                          {isExpanded && (
                            <div className="mt-4 pt-4 border-t space-y-2">
                              {student.desiredAdmissionTerm && (
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">Admission Term:</span>{' '}
                                  <span className="text-gray-600">{student.desiredAdmissionTerm}</span>
                                </div>
                              )}
                              {student.desiredUniversities && student.desiredUniversities.length > 0 && (
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">Desired Universities:</span>{' '}
                                  <span className="text-gray-600">{student.desiredUniversities.join(', ')}</span>
                                </div>
                              )}
                              {student.major && (
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">Major:</span>{' '}
                                  <span className="text-gray-600">{student.major}</span>
                                </div>
                              )}
                              <div className="pt-2">
                                <Link
                                  href={`/students/${student.id}`}
                                  className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Full Profile
                                </Link>
                              </div>
                            </div>
                          )}

                          {/* Expand/Collapse Button */}
                          <button
                            onClick={() => toggleCardExpansion(student.id)}
                            className="mt-4 w-full flex items-center justify-center text-gray-500 hover:text-gray-700 py-2"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="w-5 h-5 mr-1" />
                                <span className="text-sm">Show Less</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-5 h-5 mr-1" />
                                <span className="text-sm">Show More</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

