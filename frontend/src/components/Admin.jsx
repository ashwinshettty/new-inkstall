import React, { useState, useEffect } from 'react';
import MainFrame from './ui/MainFrame';
import axios from 'axios';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api';

const Admin = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const response = await api.get('/leave-requests/all');
      setLeaveRequests(response.data);
    } catch (error) {
      toast.error('Error fetching leave requests');
    }
  };

  const handleStatusUpdate = async (id, status, leaveType) => {
    try {
      await api.patch(`/leave-requests/${id}/status`, { status, leaveType });
      if (status === 'approved') {
        toast.success(`Leave ${leaveType === 'paid' ? '(Paid)' : '(Unpaid)'} approved successfully`);
      } else {
        toast.info('Leave request rejected');
      }
      fetchLeaveRequests();
    } catch (error) {
      toast.error('Error updating leave request');
    }
  };

  return (
    <MainFrame>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Leave Requests</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leaveRequests.map((request) => (
                <tr key={request._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{request.teacherName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{request.reasonForLeave}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : request.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      {request.status === 'approved' && ` (${request.leaveType})`}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(request._id, 'approved', 'paid')}
                          className="text-green-600 hover:text-green-900"
                          title="Approve (Paid)"
                        >
                          <FaCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request._id, 'approved', 'unpaid')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Approve (Unpaid)"
                        >
                          <FaCheck className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(request._id, 'rejected')}
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
      </div>
    </MainFrame>
  );
};

export default Admin;
