import React, { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/profileService";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    cgpa: "",
    skills: "",
    resume: "",
    projects: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profile);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Error updating profile.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">My Profile</h2>
        {message && <p className="text-green-500 mb-4">{message}</p>}

        <input
          type="text"
          name="name"
          value={profile.name}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full p-2 border rounded mb-4"
          required
        />
        <input
          type="email"
          name="email"
          value={profile.email}
          onChange={handleChange}
          placeholder="Email"
          className="w-full p-2 border rounded mb-4"
          required
        />
        <input
          type="text"
          name="cgpa"
          value={profile.cgpa}
          onChange={handleChange}
          placeholder="CGPA"
          className="w-full p-2 border rounded mb-4"
        />
        <input
          type="text"
          name="skills"
          value={profile.skills}
          onChange={handleChange}
          placeholder="Skills (comma separated)"
          className="w-full p-2 border rounded mb-4"
        />
        <textarea
          name="projects"
          value={profile.projects}
          onChange={handleChange}
          placeholder="Projects"
          className="w-full p-2 border rounded mb-4"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
}