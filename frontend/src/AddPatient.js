import React, { useState } from "react";

function AddPatient() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    disease: ""
  });

  const submit = async () => {
    await fetch("http://localhost:8000/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    alert("Patient added");
  };

  return (
    <div>
      <h2>Add Patient</h2>

      <input placeholder="Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })} />

      <input placeholder="Age"
        onChange={(e) => setForm({ ...form, age: e.target.value })} />

      <input placeholder="Disease"
        onChange={(e) => setForm({ ...form, disease: e.target.value })} />

      <button onClick={submit}>Submit</button>
    </div>
  );
}

export default AddPatient;