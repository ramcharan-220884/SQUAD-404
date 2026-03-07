import React, { useEffect, useState } from "react";
import { getStats, getUsers, updateUserStatus, sendNotification } from "../services/adminService";

export default function AdminDashboard() {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [notification, setNotification] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsData = await getStats();
        setStats(statsData);
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleUserStatus = async (userId, status) => {
    try {
      await updateUserStatus(userId, status);
      setMessage("User status updated!");
      setUsers(users.map(u => u.id === userId ? { ...u, status } : u));
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

      {/* User Management Section */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <div className="bg-white p-4 rounded shadow">
          {users.map((user) => (
            <div key={user.id} className="flex justify-between items-center mb-2">
              <span>{user.name} ({user.role})</span>
              <select
                value={user.status}
                onChange={(e) => handleUserStatus(user.id, e.target.value)}
                className="border rounded p-1"
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