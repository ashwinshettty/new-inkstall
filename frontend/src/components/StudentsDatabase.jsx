import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiEdit2, FiChevronDown } from 'react-icons/fi';
import { BiDollar } from 'react-icons/bi';
import api from "../api";

function StudentsDatabase() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
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

    fetchStudents();
  }, []);

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Board</th>
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
                <td className="px-6 py-4 whitespace-nowrap">{student.grade || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.board || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">{typeof student.school === "object" ? JSON.stringify(student.school) : student.school || "N/A"}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {Array.isArray(student.phoneNumbers) ? (
                    student.phoneNumbers.map((phone, index) => (
                      <div key={index}>{phone.number} ({phone.relation})</div>
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
                    {Array.isArray(student.subjects) ? (
                      student.subjects.map((subject, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {subject}
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
                    <button className="text-gray-600 hover:text-gray-800">
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-800">
                      <FiChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentsDatabase; 
