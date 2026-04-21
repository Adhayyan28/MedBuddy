import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./login";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [waitlist, setWaitlist] = useState([]);

  // 👉 NEW FORM STATE
  const [form, setForm] = useState({
    name: "",
    phone: "",
    condition: "",
    medications: "",
  });

  // 👉 FETCH PATIENTS
  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/patients", {
        headers: {
          Authorization: token,
        },
      });
      setPatients(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  const fetchWaitlist = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/waitlist", {
        headers: {
          Authorization: token,
        },
      });

      setWaitlist(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchPatients();
      fetchWaitlist();
    }
  }, [isLoggedIn]);

  // GET SUMMARY
  const getSummary = async (id) => {
    const token = localStorage.getItem("token");

    const res = await axios.get(`http://localhost:5000/api/responses/summary/${id}`, {
      headers: {
        Authorization: token,
      },
    });
    setSummary(res.data);
    setSelectedPatient(id);
  };
  //Waitlist
  const addToWaitlist = async (patientId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/waitlist/add",
        {
          patientId,
          reason: "Manual or high risk",
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      fetchWaitlist();

      if (res.data.message) {
        alert(res.data.message); // Already in waitlist
      } else {
        alert("Added to waitlist");
      }
    } catch (err) {
      console.log(err);
      alert("Error adding to waitlist");
    }
  };
  //  HANDLE INPUT
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  //  ADD PATIENT
  const addPatient = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      alert("Name and Phone are required");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/patients/add",
        {
          ...form,
          medications: form.medications.split(","),
        },
        {
          headers: {
            Authorization: token,
          },
        },
      );

      fetchPatients();
      setForm({ name: "", phone: "", condition: "", medications: "" });
    } catch (err) {
      console.log(err);
    }
  };
  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }
  //delete patient
  const deletePatient = async (id) => {
    const token = localStorage.getItem("token");

    await axios.delete(`http://localhost:5000/api/patients/${id}`, {
      headers: { Authorization: token },
    });

    fetchPatients();
  };
  //del waitlist
  const deleteWaitlist = async (id) => {
    const token = localStorage.getItem("token");

    await axios.delete(`http://localhost:5000/api/waitlist/${id}`, {
      headers: { Authorization: token },
    });

    fetchWaitlist();
  };

  return (
    <div className="app-container" style={{ padding: 20 }}>
      <h1 className="header">MedBuddy Dashboard</h1>

      <button
        className="btn"
        onClick={() => {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }}
        style={{
          marginBottom: 10,
          padding: "5px 10px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
      <div className="main-layout">
        <div className="left-panel">
          <h2>Add Patient</h2>

          <input
            name="name"
            placeholder="Name"
            required
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="phone"
            placeholder="Phone"
            required
            value={form.phone}
            onChange={handleChange}
          />
          <input
            name="condition"
            placeholder="Condition"
            value={form.condition}
            onChange={handleChange}
          />
          <input
            name="medications"
            placeholder="Medications (comma separated)"
            value={form.medications}
            onChange={handleChange}
          />

          <br />
          <br />
          <button className="btn" onClick={addPatient}>
            Add Patient
          </button>

          <h2>Patients</h2>

          {patients.map((p) => (
            <div key={p._id} className="card patient-card" onClick={() => getSummary(p._id)}>
              <h3>{p.name}</h3>
              <p>{p.condition}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePatient(p._id);
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <div className="right-panel">
          {selectedPatient && <p>Viewing patient ID: {selectedPatient}</p>}

          {/* SUMMARY */}
          {summary && summary.latestRisk && (
            <div style={{ marginTop: 20 }}>
              <h2>Patient Summary</h2>

              <p>
                Risk:{" "}
                <span className={`badge ${summary.latestRisk.toLowerCase()}`}>
                  {summary.latestRisk}
                </span>
              </p>

              <p>Feeling: {summary.feeling}</p>
              <p>Symptoms: {summary.symptoms}</p>
              <p>Medication: {summary.medicationTaken}</p>

              <button
                className="btn"
                onClick={() => addToWaitlist(selectedPatient)}
                style={{ marginTop: 10 }}
              >
                Add to Waitlist
              </button>
            </div>
          )}

          {/* WAITLIST (separate block) */}
          <h2>Waitlist</h2>

          {waitlist.length === 0 ? (
            <p>No patients in waitlist</p>
          ) : (
            waitlist.map((w) => (
              <div key={w._id} className="card waitlist-card">
                <p>
                  <b>{w.patientId?.name}</b>
                </p>
                <p>Reason: {w.reason}</p>
                <p>Status: {w.status}</p>
                <button className="btn" onClick={() => deleteWaitlist(w._id)}>
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
export default App;
