import React, { useState, useEffect } from "react";
import MainFrame from "./ui/MainFrame";
import { FaCheck, FaTimes, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import { Download, FileText, ExternalLink, Filter } from "lucide-react";
import api from "../api";
import * as XLSX from 'xlsx';

const Admin = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [dailyUpdates, setDailyUpdates] = useState([]);
  const [filteredUpdates, setFilteredUpdates] = useState([]);
  const [teachers, setTeachers] = useState({});  // Cache for teacher data
  const [filters, setFilters] = useState({
    studentName: "",
    teacherName: "",
    subject: "",
    date: ""
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLeaveRequests();
    fetchDailyUpdates();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, dailyUpdates]);

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get("/leave-requests/all");
      setLeaveRequests(response.data);
    } catch (error) {
      toast.error("Error fetching leave requests");
    }
  };

  // Function to fetch teacher data from users collection
  const fetchTeacherData = async (teacherId) => {
    // If we already have this teacher in our cache, return it
    if (teachers[teacherId]) {
      return teachers[teacherId];
    }
    
    try {
      const response = await api.get(`/users/${teacherId}`);
      const teacherData = response.data;
      
      // Update the teachers cache
      setTeachers(prev => ({
        ...prev,
        [teacherId]: teacherData
      }));
      
      return teacherData;
    } catch (error) {
      console.error(`Error fetching teacher data for ID: ${teacherId}`, error);
      return { name: "Unknown Teacher" };
    }
  };

  const fetchDailyUpdates = async () => {
    try {
      const response = await api.get("/daily-updates");
      
      // Process the data to flatten the nested structure
      const processedData = [];
      
      // Create an array to collect promises for teacher data fetching
      const teacherPromises = [];
      
      response.data.forEach((update, index) => {
        // Store the teacher ID for reference
        const teacherId = update.createdBy?._id || update.createdBy;
        
        if (teacherId && !teachers[teacherId]) {
          // Fetch teacher data and store the promise
          teacherPromises.push(
            fetchTeacherData(teacherId).then(teacherData => {
              response.data[index].resolvedTeacherName = teacherData.name;
            })
          );
        } else if (teachers[teacherId]) {
          response.data[index].resolvedTeacherName = teachers[teacherId].name;
        } else {
          response.data[index].resolvedTeacherName = "Unknown Teacher";
        }
      });
      
      // Wait for all teacher data to be fetched
      await Promise.all(teacherPromises);
      
      // Now process the updates with teacher names
      response.data.forEach(update => {
        // Get teacher name from resolved data
        const teacherName = update.resolvedTeacherName || update.createdBy?.name || "Unknown Teacher";
        
        // Process each student and subject combination
        update.students.forEach(student => {
          update.subjects.forEach(subject => {
            subject.chapters.forEach(chapter => {
              processedData.push({
                _id: `${update._id}-${student._id}-${subject._id}-${chapter._id}`,
                date: update.date,
                teacherId: update.createdBy?._id || update.createdBy,
                teacherName: teacherName,
                studentName: student.name,
                studentGrade: student.grade,
                // studentBoard: student.board,
                subject: subject.name,
                chapterName: chapter.chapterName,
                progress: chapter.chapterCompletion,
                // notes: chapter.notes,
                kSheetUrl: chapter.kSheetUrl || "",
                hasKSheet: chapter.kSheet === "yes"
              });
            });
          });
        });
      });
      
      setDailyUpdates(processedData);
      setFilteredUpdates(processedData);
    } catch (error) {
      toast.error("Error fetching daily updates");
      console.error(error);
    }
  };

  const handleStatusUpdate = async (id, status, leaveType) => {
    try {
      await api.patch(`/leave-requests/${id}/status`, { status, leaveType });
      if (status === "approved") {
        toast.success(
          `Leave ${leaveType === "paid" ? "(Paid)" : "(Unpaid)"} approved successfully`
        );
      } else {
        toast.info("Leave request rejected");
      }
      fetchLeaveRequests();
    } catch (error) {
      toast.error("Error updating leave request");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    let filtered = [...dailyUpdates];
    
    if (filters.studentName) {
      filtered = filtered.filter(update => 
        update.studentName.toLowerCase().includes(filters.studentName.toLowerCase()));
    }
    
    if (filters.teacherName) {
      filtered = filtered.filter(update => 
        update.teacherName.toLowerCase().includes(filters.teacherName.toLowerCase()));
    }
    
    if (filters.subject) {
      filtered = filtered.filter(update => 
        update.subject.toLowerCase().includes(filters.subject.toLowerCase()));
    }
    
    if (filters.date) {
      filtered = filtered.filter(update => {
        const updateDate = new Date(update.date).toLocaleDateString();
        const filterDate = new Date(filters.date).toLocaleDateString();
        return updateDate === filterDate;
      });
    }
    
    setFilteredUpdates(filtered);
  };

  const resetFilters = () => {
    setFilters({
      studentName: "",
      teacherName: "",
      subject: "",
      date: ""
    });
    setFilteredUpdates(dailyUpdates);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredUpdates.map(update => ({
        Date: new Date(update.date).toLocaleDateString(),
        Teacher: update.teacherName,
        Student: `${update.studentName} (${update.studentGrade})`,
        Board: update.studentBoard,
        Subject: update.subject,
        Chapter: update.chapterName,
        Progress: `${update.progress}%`,
        Notes: update.notes,
        'K-Sheet': update.hasKSheet ? 'Available' : 'Not Available'
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Updates");
    
    // Buffer to XLSX
    XLSX.writeFile(workbook, "Daily_Updates_Report.xlsx");
    toast.success("Report exported successfully");
  };

  return (
    <MainFrame>
      <div className="p-6 space-y-8">
        {/* Leave Requests Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Leave Requests</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {leaveRequests.map((request) => (
                  <tr key={request._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.teacherName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(request.startDate).toLocaleDateString()} -{" "}
                      {new Date(request.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.reasonForLeave}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs font-semibold rounded-full ${
                          request.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {request.status.charAt(0).toUpperCase() +
                          request.status.slice(1)}
                        {request.status === "approved" &&
                          ` (${request.leaveType})`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {request.status === "pending" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleStatusUpdate(request._id, "approved", "paid")
                            }
                            className="text-green-600 hover:text-green-900"
                            title="Approve (Paid)"
                          >
                            <FaCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(request._id, "approved", "unpaid")
                            }
                            className="text-blue-600 hover:text-blue-900"
                            title="Approve (Unpaid)"
                          >
                            <FaCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleStatusUpdate(request._id, "rejected")
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <FaTimes className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Daily Updates Report Section */}
        <section className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-secondary">
              Daily Updates Report
            </h2>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="btn-secondary flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <button 
                onClick={exportToExcel}
                className="btn-primary flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export to Excel
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher
                  </label>
                  <input
                    type="text"
                    name="teacherName"
                    value={filters.teacherName}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Filter by teacher"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <input
                    type="text"
                    name="studentName"
                    value={filters.studentName}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Filter by student"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={filters.subject}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Filter by subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={filters.date}
                    onChange={handleFilterChange}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="btn-outline"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chapter
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    K-Sheet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUpdates.length > 0 ? (
                  filteredUpdates.map((update) => (
                    <tr key={update._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(update.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {update.teacherName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {update.studentName} ({update.studentGrade})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {update.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {update.chapterName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {update.progress}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {update.hasKSheet && update.kSheetUrl ? (
                          <a
                            href={update.kSheetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary hover:text-primary/80"
                          >
                            <FileText className="w-4 h-4" />
                            <span>View K-Sheet</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-gray-500">No K-Sheet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={`whatsapp://send?text=Daily Update: ${update.teacherName} taught ${update.subject} (${update.chapterName}) to ${update.studentName} with ${update.progress}% progress on ${new Date(update.date).toLocaleDateString()}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#128C7E] transition-colors"
                        >
                          <FaWhatsapp className="w-5 h-5 text-white" />
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                      No daily updates found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainFrame>
  );
};

export default Admin;