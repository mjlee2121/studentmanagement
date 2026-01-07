'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { Student } from '@/lib/types';
import { Search, Plus, Eye } from 'lucide-react';

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [admissionTerm, setAdmissionTerm] = useState('');
  const [desiredUniversity, setDesiredUniversity] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Students</h2>
          <Link href="/students/new" className="btn-primary inline-flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Link>
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

