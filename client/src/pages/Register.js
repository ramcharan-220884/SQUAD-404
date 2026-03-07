import React, { useState } from "react";
import { registerStudent } from "../services/studentService";

function Register() {

  const [form, setForm] = useState({
    name: "",
    email: "",
    password_hash: "",
    cgpa: "",
    backlogs: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await registerStudent(form);

    alert(res.message);
  };

  return (
    <div>
      <h2>Student Registration</h2>

      <form onSubmit={handleSubmit}>

        <input name="name" placeholder="Name" onChange={handleChange} />

        <input name="email" placeholder="Email" onChange={handleChange} />

        <input name="password_hash" placeholder="Password" onChange={handleChange} />

        <input name="cgpa" placeholder="CGPA" onChange={handleChange} />

        <input name="backlogs" placeholder="Backlogs" onChange={handleChange} />

        <button type="submit">Register</button>

      </form>
    </div>
  );
}

export default Register;