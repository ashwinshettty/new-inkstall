import React, { useState, useEffect } from "react";
import MainFrame from "./ui/MainFrame";
import { FaCheck, FaTimes, FaWhatsapp } from "react-icons/fa";
import { toast } from "react-toastify";
import { Download, FileText, ExternalLink } from "lucide-react";
import api from "../api";

const Admin = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get("/leave-requests/all");
      setLeaveRequests(response.data);
    } catch (error) {
      toast.error("Error fetching leave requests");
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
            <button className="btn-primary flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date &amp; Time
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
                {/* Static Row 1 */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    25/02/2025 09:30
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    John Doe
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Alice (10)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Mathematics
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    80%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href="https://example.com/k-sheet.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:text-primary/80"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View K-Sheet</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href="whatsapp://send?text=Sample%20Daily%20Update%20Info"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#128C7E] transition-colors"
                    >
                      <FaWhatsapp className="w-5 h-5 text-white" />
                    </a>
                  </td>
                </tr>
                {/* Static Row 2 */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    25/02/2025 10:00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Jane Smith
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Bob (9)
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Physics
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    65%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="text-gray-500">No K-Sheet</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <a
                      href="whatsapp://send?text=Sample%20Daily%20Update%20Info"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366] hover:bg-[#128C7E] transition-colors"
                    >
                      <FaWhatsapp className="w-5 h-5 text-white" />
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainFrame>
  );
};

export default Admin;
