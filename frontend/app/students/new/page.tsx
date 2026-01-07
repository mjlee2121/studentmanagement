'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import api from '@/lib/api';
import { ServiceType } from '@/lib/types';
import { Upload, X } from 'lucide-react';

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [generalError, setGeneralError] = useState('');
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    
    // Admission Process
    passportCollected: false,
    applicationFormCollected: false,
    highschoolTranscriptCollected: false,
    collegeTranscriptCollected: false,
    desiredAdmissionTerm: '',
    desiredUniversities: [] as string[],
    major: '',
    homestayAddress: '',
    bostonArrivalDate: '',
    shorelightApplication: false,
    shorelightUniversities: [] as string[],
    
    // After Graduation
    stage2Services: false,
    expectedGraduationDate: '',
    
    // Temporary field for adding universities
    newUniversity: '',
    newShorelightUniversity: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const addUniversity = () => {
    if (formData.newUniversity.trim()) {
      setFormData(prev => ({
        ...prev,
        desiredUniversities: [...prev.desiredUniversities, prev.newUniversity.trim()],
        newUniversity: '',
      }));
    }
  };

  const removeUniversity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      desiredUniversities: prev.desiredUniversities.filter((_, i) => i !== index),
    }));
  };

  const addShorelightUniversity = () => {
    if (formData.newShorelightUniversity.trim()) {
      setFormData(prev => ({
        ...prev,
        shorelightUniversities: [...prev.shorelightUniversities, prev.newShorelightUniversity.trim()],
        newShorelightUniversity: '',
      }));
    }
  };

  const removeShorelightUniversity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      shorelightUniversities: prev.shorelightUniversities.filter((_, i) => i !== index),
    }));
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }

    setUploadingPdf(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);

      const response = await api.post('/students/parse-application', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Auto-fill form with parsed data
      if (response.data) {
        setFormData(prev => ({
          ...prev,
          ...response.data,
          // Ensure arrays are arrays
          desiredUniversities: response.data.desiredUniversities || prev.desiredUniversities,
          shorelightUniversities: response.data.shorelightUniversities || prev.shorelightUniversities,
        }));
        alert('Application form parsed successfully! Please review and complete the form.');
      }
    } catch (error: any) {
      console.error('PDF parsing error:', error);
      alert(error.response?.data?.error || 'Failed to parse PDF. Please fill the form manually.');
    } finally {
      setUploadingPdf(false);
      // Reset file input
      e.target.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setGeneralError('');

    try {
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        passportCollected: formData.passportCollected,
        applicationFormCollected: formData.applicationFormCollected,
        highschoolTranscriptCollected: formData.highschoolTranscriptCollected,
        collegeTranscriptCollected: formData.collegeTranscriptCollected,
        desiredAdmissionTerm: formData.desiredAdmissionTerm?.trim() || undefined,
        desiredUniversities: formData.desiredUniversities,
        major: formData.major?.trim() || undefined,
        homestayAddress: formData.homestayAddress?.trim() || undefined,
        bostonArrivalDate: formData.bostonArrivalDate || undefined,
        shorelightApplication: formData.shorelightApplication,
        shorelightUniversities: formData.shorelightUniversities,
        stage2Services: formData.stage2Services,
        expectedGraduationDate: formData.expectedGraduationDate || undefined,
      };

      const response = await api.post('/students', submitData);
      router.push(`/students/${response.data.id}`);
    } catch (error: any) {
      console.error('Error creating student:', error);
      
      if (error.response?.data?.fieldErrors) {
        // Set field-specific errors
        setErrors(error.response.data.fieldErrors);
        setGeneralError(error.response.data.error || 'Please fix the errors below and try again.');
      } else if (error.response?.data?.error) {
        // Set general error message
        setGeneralError(error.response.data.error);
      } else if (error.response?.status === 401) {
        setGeneralError('Your session has expired. Please log in again.');
        setTimeout(() => router.push('/login'), 2000);
      } else if (error.response?.status === 403) {
        setGeneralError('You do not have permission to create students. Please contact an administrator.');
      } else if (error.response?.status >= 500) {
        setGeneralError('Server error. Please try again later or contact support if the problem persists.');
      } else {
        setGeneralError('Unable to create student. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Add New Student</h2>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {/* Error Messages */}
          {generalError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following issues:</h3>
              <p className="text-sm text-red-700 whitespace-pre-line">{generalError}</p>
            </div>
          )}

          {/* PDF Upload Section */}
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Upload Application Form (PDF)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a PDF application form to automatically fill in student information
            </p>
            <label className="block">
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfUpload}
                disabled={uploadingPdf}
                className="hidden"
                id="pdf-upload"
              />
              <div className="btn-primary inline-flex items-center cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                {uploadingPdf ? 'Processing PDF...' : 'Add an application form'}
              </div>
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    className={`input-field ${errors.firstName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    className={`input-field ${errors.lastName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    className="input-field"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    className={`input-field ${errors.dateOfBirth ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Admission Process */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Admission Process</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="passportCollected"
                    className="mr-2"
                    checked={formData.passportCollected}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm text-gray-700">Passport Collected</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="applicationFormCollected"
                    className="mr-2"
                    checked={formData.applicationFormCollected}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm text-gray-700">Application Form Collected</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="highschoolTranscriptCollected"
                    className="mr-2"
                    checked={formData.highschoolTranscriptCollected}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm text-gray-700">High School Transcript Collected</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="collegeTranscriptCollected"
                    className="mr-2"
                    checked={formData.collegeTranscriptCollected}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm text-gray-700">College Transcript Collected</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Desired Admission Term
                  </label>
                  <input
                    type="text"
                    name="desiredAdmissionTerm"
                    placeholder="e.g., Fall 2024"
                    className="input-field"
                    value={formData.desiredAdmissionTerm}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major
                  </label>
                  <input
                    type="text"
                    name="major"
                    className="input-field"
                    value={formData.major}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desired Universities
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add university name"
                    className="input-field flex-1"
                    value={formData.newUniversity}
                    onChange={(e) => setFormData(prev => ({ ...prev, newUniversity: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUniversity())}
                  />
                  <button
                    type="button"
                    onClick={addUniversity}
                    className="btn-secondary"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.desiredUniversities.map((uni, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {uni}
                      <button
                        type="button"
                        onClick={() => removeUniversity(index)}
                        className="ml-2 hover:text-primary-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Homestay Address
                  </label>
                  <textarea
                    name="homestayAddress"
                    rows={3}
                    className="input-field"
                    value={formData.homestayAddress}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Boston Arrival Date
                  </label>
                  <input
                    type="date"
                    name="bostonArrivalDate"
                    className={`input-field ${errors.bostonArrivalDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    value={formData.bostonArrivalDate}
                    onChange={handleInputChange}
                  />
                  {errors.bostonArrivalDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.bostonArrivalDate}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    name="shorelightApplication"
                    className="mr-2"
                    checked={formData.shorelightApplication}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm text-gray-700">Shorelight Application</span>
                </label>

                {formData.shorelightApplication && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shorelight Universities
                    </label>
                    <div className="flex gap-2 mb-2">
                      <select
                        className="input-field flex-1"
                        value={formData.newShorelightUniversity}
                        onChange={(e) => setFormData(prev => ({ ...prev, newShorelightUniversity: e.target.value }))}
                      >
                        <option value="">Select a university</option>
                        <option value="Stony Brook">Stony Brook</option>
                        <option value="UMASS Boston">UMASS Boston</option>
                        <option value="University of Illinois Chicago">University of Illinois Chicago</option>
                      </select>
                      <button
                        type="button"
                        onClick={addShorelightUniversity}
                        className="btn-secondary"
                        disabled={!formData.newShorelightUniversity}
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.shorelightUniversities.map((uni, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                        >
                          {uni}
                          <button
                            type="button"
                            onClick={() => removeShorelightUniversity(index)}
                            className="ml-2 hover:text-green-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* After Graduation */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">After Graduation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="stage2Services"
                    className="mr-2"
                    checked={formData.stage2Services}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm text-gray-700">Stage 2 Services</span>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Graduation Date
                  </label>
                  <input
                    type="date"
                    name="expectedGraduationDate"
                    className={`input-field ${errors.expectedGraduationDate ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    value={formData.expectedGraduationDate}
                    onChange={handleInputChange}
                  />
                  {errors.expectedGraduationDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.expectedGraduationDate}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

