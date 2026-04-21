import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./login";
import "./App.css";
import { Routes, Route, Link, Navigate } from "react-router-dom";
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [waitlist, setWaitlist] = useState([]);
  const [followUp, setFollowUp] = useState({
    patientId: "",
    feeling: "",
    symptoms: "",
    medicationTaken: "",
  });
  const [search, setSearch] = useState("");

  // 👉 NEW FORM STATE
  const [form, setForm] = useState({
    name: "",
    phone: "",
    condition: "",
    medications: "",
  });
  //followup
  const handleFollowUpChange = (e) => {
    setFollowUp({
      ...followUp,
      [e.target.name]: e.target.value,
    });
  };

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

  //submit fnc
  const submitFollowUp = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post("http://localhost:5000/api/responses/add", followUp, {
        headers: {
          Authorization: token,
        },
      });

      alert("Response submitted");

      // refresh summary instantly
      if (followUp.patientId) {
        getSummary(followUp.patientId);
      }

      // reset form
      setFollowUp({
        patientId: "",
        feeling: "",
        symptoms: "",
        medicationTaken: "",
      });
    } catch (err) {
      console.log(err);
      alert("Error submitting response");
    }
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
    <div className="app-container">
      <h1 className="header">MedBuddy</h1>

      {/* NAVBAR */}
      <div className="navbar">
        <Link to="/doctor">Doctor Dashboard</Link> | <Link to="/patient">Patient Follow-Up</Link>
      </div>

      <Routes>
        {/* DEFAULT ROUTE */}
        <Route path="/" element={<Navigate to="/doctor" />} />

        {/* ================= DOCTOR DASHBOARD ================= */}
        <Route
          path="/doctor"
          element={
            <>
              {/* ✅ METRICS HERE */}
              <div style={{ display: "flex", gap: 20, marginBottom: 20 }}>
                <div className="card" style={{ flex: 1 }}>
                  <h3>Total Patients</h3>
                  <p>{patients.length}</p>
                </div>

                <div className="card" style={{ flex: 1 }}>
                  <h3>Waitlist</h3>
                  <p>{waitlist.length}</p>
                </div>
              </div>

              <div className="main-layout">
                {/* LEFT PANEL */}
                <div className="left-panel">
                  <button
                    className="btn"
                    onClick={() => {
                      localStorage.removeItem("token");
                      setIsLoggedIn(false);
                    }}
                    style={{ marginBottom: 10 }}
                  >
                    Logout
                  </button>

                  <h2>Add Patient</h2>

                  <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
                  <input
                    name="phone"
                    placeholder="Phone"
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
                    placeholder="Medications"
                    value={form.medications}
                    onChange={handleChange}
                  />

                  <br />
                  <br />
                  <button className="btn" onClick={addPatient}>
                    Add Patient
                  </button>
                  <input
                    placeholder="Search patient..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />

                  <h2>Patients</h2>

                  {patients
                    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
                    .map((p) => (
                      <div
                        key={p._id}
                        className="card patient-card"
                        onClick={() => getSummary(p._id)}
                      >
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

                {/* RIGHT PANEL */}
                <div className="right-panel">
                  {selectedPatient && <p>Viewing patient ID: {selectedPatient}</p>}

                  {summary && summary.latestRisk && (
                    <div className="card">
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
                      <p>
                        Last Updated:{" "}
                        {new Date(summary.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>

                      <button className="btn" onClick={() => addToWaitlist(selectedPatient)}>
                        Add to Waitlist
                      </button>
                    </div>
                  )}

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
            </>
          }
        />

        {/* ================= PATIENT PAGE ================= */}
        <Route
          path="/patient"
          element={
            <div>
              <h2>Patient Follow-Up</h2>

              <select name="patientId" value={followUp.patientId} onChange={handleFollowUpChange}>
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <br />
              <br />

              <select name="feeling" value={followUp.feeling} onChange={handleFollowUpChange}>
                <option value="">Feeling</option>
                <option value="Good">Good</option>
                <option value="Okay">Okay</option>
                <option value="Bad">Bad</option>
              </select>

              <br />
              <br />

              <select name="symptoms" value={followUp.symptoms} onChange={handleFollowUpChange}>
                <option value="">Symptoms</option>
                <option value="None">None</option>
                <option value="Mild">Mild</option>
                <option value="Severe">Severe</option>
              </select>

              <br />
              <br />

              <select
                name="medicationTaken"
                value={followUp.medicationTaken}
                onChange={handleFollowUpChange}
              >
                <option value="">Medication Taken?</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>

              <br />
              <br />

              <button className="btn" onClick={submitFollowUp}>
                Submit Follow-Up
              </button>
            </div>
          }
        />
      </Routes>
    </div>
  );
}
export default App;
