import React, { useEffect, useState } from "react";
import { getStats, getUsers, updateUserStatus, sendNotification, getPendingUsers, approveUser, rejectUser } from "../services/adminService";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await getStats();
        setStats(statsData);
        const usersData = await getUsers();
        setUsers(usersData);
        const pendingData = await getPendingUsers();
        setPendingUsers(pendingData);
      } catch (err) {
        console.error(err);
        setMessage("Error loading initial data.");
      }
    };
    fetchData();
  }, []);

  const handleUserStatus = async (userId, status, role) => {
    try {
      await updateUserStatus(userId, status, role);
      setMessage("User status updated!");
      setUsers(users.map(u => u.id === userId && u.role === role ? { ...u, status } : u));
    } catch (err) {
      setMessage("Error updating user status.");
    }
  };

  const handleNotification = async () => {
    try {
      await sendNotification(notification);
      setMessage("Notification sent!");
      setNotification("");
    } catch (err) {
      setMessage("Error sending notification.");
    }
  };

  const handleApprove = async (id, type) => {
    try {
      await approveUser(id, type);
      setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} approved successfully!`);
      // Remove from pending
      setPendingUsers(pendingUsers.filter(u => !(u.id === id && u.type === type)));
      // Refresh user list if we want them to show down there
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (err) {
      setMessage("Error approving user.");
    }
  };

  const handleReject = async (id, type) => {
    if (!window.confirm("Are you sure you want to reject and delete this registration?")) return;
    try {
      await rejectUser(id, type);
      setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} registration rejected!`);
      setPendingUsers(pendingUsers.filter(u => !(u.id === id && u.type === type)));
    } catch (err) {
      setMessage("Error rejecting user.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {message && <p className="text-green-500 mb-4">{message}</p>}

      {/* Analytics Section */}
      <section className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg">Total Students</h2>
          <p>{stats.totalStudents || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg">Placed Students</h2>
          <p>{stats.placedStudents || 0}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg">Active Companies</h2>
          <p>{stats.activeCompanies || 0}</p>
        </div>
      </section>

      {/* Pending Approvals Section */}
      <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Students Approvals */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-orange-600">Pending Students</h2>
          <div className="bg-white p-4 rounded shadow border-l-4 border-orange-400">
            {pendingUsers.filter(u => u.type === 'student').length === 0 ? (
              <p className="text-gray-500">No pending students at this time.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pendingUsers.filter(u => u.type === 'student').map(user => (
                  <li key={`${user.type}-${user.id}`} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(user.id, user.type)}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-3 rounded transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.id, user.type)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded transition-colors text-sm"
                      >
                        Disapprove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Company Approvals */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-purple-600">Pending Recruiters</h2>
          <div className="bg-white p-4 rounded shadow border-l-4 border-purple-400">
            {pendingUsers.filter(u => u.type === 'company').length === 0 ? (
              <p className="text-gray-500">No pending recruiters at this time.</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pendingUsers.filter(u => u.type === 'company').map(user => (
                  <li key={`${user.type}-${user.id}`} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleApprove(user.id, user.type)}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-1.5 px-3 rounded transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.id, user.type)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded transition-colors text-sm"
                      >
                        Disapprove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* User Management Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <div className="bg-white p-4 rounded shadow">
          {users.map((user) => (
            <div key={user.id} className="flex justify-between items-center mb-2 p-2 border-b last:border-0 hover:bg-gray-50">
              <span className="font-medium text-gray-700">{user.name} <span className="text-xs bg-gray-200 px-2 py-1 rounded ml-2">{user.role}</span></span>
              <select
                value={user.status}
                onChange={(e) => handleUserStatus(user.id, e.target.value, user.role)}
                className="border border-gray-300 rounded p-1 text-sm bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Active">Active</option>
                <option value="Blocked">Blocked</option>
              </select>
            </div>
          ))}
        </div>
      </section>

      {/* Notifications Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Send Notification</h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Enter notification message"
            value={notification}
            onChange={(e) => setNotification(e.target.value)}
            className="p-2 border rounded w-full"
          />
          <button
            onClick={handleNotification}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Send
          </button>
        </div>
      </section>
    </div>
  );
}