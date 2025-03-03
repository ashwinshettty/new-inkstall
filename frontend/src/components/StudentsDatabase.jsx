import React, { useEffect, useState } from 'react';
import { FiEdit2, FiChevronDown, FiTrash2 } from 'react-icons/fi';
import { BiDollar } from 'react-icons/bi';
import api from "../api";

function StudentsDatabase() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/students', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setStudents(response.data.students || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEditClick = (student) => {
    setCurrentStudent(student);
    setShowEditModal(true);
  };

  const handleDeleteClick = (student) => {
    setCurrentStudent(student);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/students/${currentStudent._id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Refresh student list
      fetchStudents();
      setShowDeleteConfirm(false);
    } catch (err) {
      setError(`Error deleting student: ${err.message}`);
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      await api.put(`/students/${currentStudent._id}`, formData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      // Refresh student list
      fetchStudents();
      setShowEditModal(false);
    } catch (err) {
      setError(`Error updating student: ${err.message}`);
    }
  };

  // Helper function to safely render any value, including objects
  const renderValue = (value) => {
    if (value === null || value === undefined) {
      return "N/A";
    }
    
    if (typeof value === "object") {
      // If it's an object with name property, display that
      if (value.name) {
        return value.name;
      }
      // Otherwise stringify the object, but only for display purposes
      return JSON.stringify(value);
    }
    
    return value;
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.studentId || student._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{student.studentName || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.studentId || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{renderValue(student.school)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {Array.isArray(student.phoneNumbers) && student.phoneNumbers.length > 0 ? (
                    student.phoneNumbers.map((phone, index) => (
                      <div key={index}>{phone.number} ({phone.relation})</div>
                    ))
                  ) : Array.isArray(student.contactInformation) && student.contactInformation.length > 0 ? (
                    student.contactInformation.map((contact, index) => (
                      <div key={index}>{contact.number} ({contact.relation})</div>
                    ))
                  ) : (
                    "No Contact Info"
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                    student.status === 'ADMISSION_DUE' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {student.status || "N/A"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {Array.isArray(student.subjects) && student.subjects.length > 0 ? (
                      student.subjects.map((subject, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {typeof subject === 'object' ? renderValue(subject) : subject}
                        </span>
                      ))
                    ) : (
                      "No Subjects"
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <BiDollar className="w-5 h-5" />
                    </button>
                    <button 
                      className="text-gray-600 hover:text-gray-800"
                      onClick={() => handleEditClick(student)}
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteClick(student)}
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {showEditModal && currentStudent && (
        <EditStudentModal 
          student={currentStudent} 
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && currentStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900">Confirm Delete</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete {currentStudent.studentName}? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none"
                onClick={handleDeleteConfirm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Edit Student Modal Component
function EditStudentModal({ student, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    studentName: student.studentName || '',
    grade: student.grade || '',
    board: student.board || '',
    school: typeof student.school === 'object' ? student.school.name || '' : student.school || '',
    status: student.status || '',
    branch: student.branch || '',
    academicYear: student.academicYear || '',
    contactInformation: Array.isArray(student.contactInformation) 
      ? student.contactInformation 
      : Array.isArray(student.phoneNumbers) 
        ? student.phoneNumbers.map(phone => ({
            relation: phone.relation || 'guardian',
            number: phone.number || '',
            relationName: phone.relationName || '',
            educationQualification: phone.educationQualification || '',
            nameOfOrganisation: phone.nameOfOrganisation || '',
            designation: phone.designation || '',
            Department: phone.Department || ''
          }))
        : [{
            relation: 'guardian',
            number: '',
            relationName: '',
            educationQualification: '',
            nameOfOrganisation: '',
            designation: '',
            Department: ''
          }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactChange = (index, field, value) => {
    const newContacts = [...formData.contactInformation];
    newContacts[index][field] = value;
    setFormData(prev => ({
      ...prev,
      contactInformation: newContacts
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Student</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student Name
              </label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Student ID
              </label>
              <input
                type="text"
                value={student.studentId || ''}
                className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Grade</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Board
              </label>
              <select
                name="board"
                value={formData.board}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Board</option>
                <option value="CBSE">CBSE</option>
                <option value="ICSE">ICSE</option>
                <option value="IGCSE">IGCSE</option>
                <option value="STATE">STATE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School
              </label>
              <input
                type="text"
                name="school"
                value={formData.school}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <input
                type="text"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select Status</option>
                <option value="ACTIVE">Active</option>
                <option value="ADMISSION_DUE">Admission Due</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <h3 className="text-lg font-medium mb-2 mt-4">Contact Information</h3>
          
          {formData.contactInformation.map((contact, index) => (
            <div key={index} className="border p-4 rounded-md mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relation
                  </label>
                  <select
                    value={contact.relation}
                    onChange={(e) => handleContactChange(index, 'relation', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={contact.number}
                    onChange={(e) => handleContactChange(index, 'number', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={contact.relationName}
                    onChange={(e) => handleContactChange(index, 'relationName', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education
                  </label>
                  <input
                    type="text"
                    value={contact.educationQualification}
                    onChange={(e) => handleContactChange(index, 'educationQualification', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={contact.nameOfOrganisation}
                    onChange={(e) => handleContactChange(index, 'nameOfOrganisation', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={contact.designation}
                    onChange={(e) => handleContactChange(index, 'designation', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={contact.Department}
                    onChange={(e) => handleContactChange(index, 'Department', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StudentsDatabase;