import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./login";
import "./App.css";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";

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
  const [form, setForm] = useState({
    name: "",
    phone: "",
    condition: "",
    medications: "",
  });

  const location = useLocation();

  const handleFollowUpChange = (e) => {
    setFollowUp({ ...followUp, [e.target.name]: e.target.value });
  };

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/patients", {
        headers: { Authorization: token },
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
        headers: { Authorization: token },
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

  const getSummary = async (id) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(`http://localhost:5000/api/responses/summary/${id}`, {
      headers: { Authorization: token },
    });
    setSummary(res.data);
    setSelectedPatient(id);
  };

  const addToWaitlist = async (patientId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/waitlist/add",
        { patientId, reason: "Manual or high risk" },
        { headers: { Authorization: token } },
      );
      fetchWaitlist();
      if (res.data.message) {
        alert(res.data.message);
      } else {
        alert("Added to waitlist");
      }
    } catch (err) {
      console.log(err);
      alert("Error adding to waitlist");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitFollowUp = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/responses/add", followUp, {
        headers: { Authorization: token },
      });
      alert("Response submitted");
      if (followUp.patientId) getSummary(followUp.patientId);
      setFollowUp({ patientId: "", feeling: "", symptoms: "", medicationTaken: "" });
    } catch (err) {
      console.log(err);
      alert("Error submitting response");
    }
  };

  const addPatient = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      alert("Name and Phone are required");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/patients/add",
        { ...form, medications: form.medications.split(",") },
        { headers: { Authorization: token } },
      );
      fetchPatients();
      setForm({ name: "", phone: "", condition: "", medications: "" });
    } catch (err) {
      console.log(err);
    }
  };

  const deletePatient = async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5000/api/patients/${id}`, {
      headers: { Authorization: token },
    });
    fetchPatients();
    if (selectedPatient === id) {
      setSelectedPatient(null);
      setSummary(null);
    }
  };

  const deleteWaitlist = async (id) => {
    const token = localStorage.getItem("token");
    await axios.delete(`http://localhost:5000/api/waitlist/${id}`, {
      headers: { Authorization: token },
    });
    fetchWaitlist();
  };

  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }

  const highRiskCount = waitlist.filter(
    (w) => w.reason?.toLowerCase().includes("high") || w.status === "pending",
  ).length;

  return (
    <div className="app-container">
      {/* ─── Navbar ─── */}
      <nav className="navbar">
        <div className="navbar-brand">
          <div className="navbar-logo">MB</div>
          <span className="navbar-title">MedBuddy</span>
        </div>

        <div className="navbar-links">
          <Link to="/doctor" className={location.pathname === "/doctor" ? "active" : ""}>
            🩺 Doctor Dashboard
          </Link>
          <Link to="/patient" className={location.pathname === "/patient" ? "active" : ""}>
            📋 Patient Follow-Up
          </Link>
        </div>

        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
          }}
        >
          Logout
        </button>
      </nav>

      {/* ─── Routes ─── */}
      <Routes>
        <Route path="/" element={<Navigate to="/doctor" />} />

        {/* ═══ DOCTOR DASHBOARD ═══ */}
        <Route
          path="/doctor"
          element={
            <div className="page-body">
              <div className="page-header">
                <h1>Doctor Dashboard</h1>
                <p>Monitor post-discharge patients and manage waitlist</p>
              </div>

              {/* Metrics */}
              <div className="metrics-row">
                <div className="metric-card">
                  <div className="metric-icon blue">👥</div>
                  <div className="metric-info">
                    <h4>Total Patients</h4>
                    <p>{patients.length}</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon amber">⏳</div>
                  <div className="metric-info">
                    <h4>Waitlist</h4>
                    <p>{waitlist.length}</p>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-icon" style={{ background: "#fee2e2" }}>
                    ⚠️
                  </div>
                  <div className="metric-info">
                    <h4>Pending Review</h4>
                    <p>{highRiskCount}</p>
                  </div>
                </div>
              </div>

              {/* Main Layout */}
              <div className="main-layout">
                {/* ── Left Panel ── */}
                <div className="left-panel">
                  {/* Add Patient */}
                  <div className="card">
                    <p className="card-title">➕ Add New Patient</p>

                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        name="name"
                        placeholder="e.g. Rahul Sharma"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone</label>
                      <input
                        name="phone"
                        placeholder="e.g. 9876543210"
                        value={form.phone}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Condition</label>
                      <input
                        name="condition"
                        placeholder="e.g. Hypertension"
                        value={form.condition}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="form-group">
                      <label>Medications (comma separated)</label>
                      <input
                        name="medications"
                        placeholder="e.g. Aspirin, Metformin"
                        value={form.medications}
                        onChange={handleChange}
                      />
                    </div>

                    <button className="btn btn-full" onClick={addPatient}>
                      Add Patient
                    </button>
                  </div>

                  {/* Patient List */}
                  <div className="card">
                    <p className="card-title">🏥 Patients</p>

                    <div className="form-group search-wrapper" style={{ marginBottom: 14 }}>
                      <span className="search-icon">🔍</span>
                      <input
                        placeholder="Search by name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>

                    <div className="patient-list">
                      {patients.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
                        .length === 0 ? (
                        <div className="empty-state">
                          <span>🔎</span>
                          No patients found
                        </div>
                      ) : (
                        patients
                          .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
                          .map((p) => (
                            <div
                              key={p._id}
                              className={`card patient-card ${selectedPatient === p._id ? "selected" : ""}`}
                              onClick={() => getSummary(p._id)}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                }}
                              >
                                <div>
                                  <h3>{p.name}</h3>
                                  <p>{p.condition || "No condition listed"}</p>
                                </div>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deletePatient(p._id);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Right Panel ── */}
                <div className="right-panel">
                  {/* Summary */}
                  {summary && summary.latestRisk ? (
                    <div className="card">
                      <p className="card-title">📊 Patient Summary</p>

                      <div className="summary-grid">
                        <div className="summary-field">
                          <label>Risk Level</label>
                          <span className={`badge ${summary.latestRisk.toLowerCase()}`}>
                            {summary.latestRisk}
                          </span>
                        </div>
                        <div className="summary-field">
                          <label>Feeling</label>
                          <span>{summary.feeling || "—"}</span>
                        </div>
                        <div className="summary-field">
                          <label>Symptoms</label>
                          <span>{summary.symptoms || "—"}</span>
                        </div>
                        <div className="summary-field">
                          <label>Medication Taken</label>
                          <span>{summary.medicationTaken || "—"}</span>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--text-muted)",
                          marginBottom: 16,
                        }}
                      >
                        Last updated:{" "}
                        {new Date(summary.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>

                      <button className="btn" onClick={() => addToWaitlist(selectedPatient)}>
                        ➕ Add to Waitlist
                      </button>
                    </div>
                  ) : selectedPatient ? (
                    <div className="empty-state">
                      <span>📭</span>
                      No follow-up data yet for this patient.
                    </div>
                  ) : (
                    <div className="empty-state">
                      <span>👈</span>
                      Select a patient to view their summary.
                    </div>
                  )}

                  {/* Waitlist */}
                  <div className="card">
                    <p className="card-title">⏳ Waitlist</p>

                    {waitlist.length === 0 ? (
                      <div className="empty-state">
                        <span>✅</span>
                        No patients in waitlist
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {waitlist.map((w) => (
                          <div key={w._id} className="card waitlist-card">
                            <div className="waitlist-card-header">
                              <div>
                                <p>
                                  <b>{w.patientId?.name}</b>
                                </p>
                                <p>Reason: {w.reason}</p>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: 6,
                                  alignItems: "flex-end",
                                }}
                              >
                                <span className="status-pill">{w.status}</span>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => deleteWaitlist(w._id)}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          }
        />

        {/* ═══ PATIENT FOLLOW-UP ═══ */}
        <Route
          path="/patient"
          element={
            <div className="page-body">
              <div className="page-header">
                <h1>Patient Follow-Up</h1>
                <p>Submit your daily health check-in</p>
              </div>

              <div className="followup-container">
                <div className="card">
                  <p className="card-title">📋 Daily Health Check-In</p>

                  <div className="form-group">
                    <label>Select Patient</label>
                    <select
                      name="patientId"
                      value={followUp.patientId}
                      onChange={handleFollowUpChange}
                    >
                      <option value="">— Choose a patient —</option>
                      {patients.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="divider" />

                  <div className="form-group">
                    <label>How are you feeling today?</label>
                    <select name="feeling" value={followUp.feeling} onChange={handleFollowUpChange}>
                      <option value="">— Select —</option>
                      <option value="Good">😊 Good</option>
                      <option value="Okay">😐 Okay</option>
                      <option value="Bad">😟 Bad</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Any symptoms?</label>
                    <select
                      name="symptoms"
                      value={followUp.symptoms}
                      onChange={handleFollowUpChange}
                    >
                      <option value="">— Select —</option>
                      <option value="None">✅ None</option>
                      <option value="Mild">🟡 Mild</option>
                      <option value="Severe">🔴 Severe</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Did you take your medication?</label>
                    <select
                      name="medicationTaken"
                      value={followUp.medicationTaken}
                      onChange={handleFollowUpChange}
                    >
                      <option value="">— Select —</option>
                      <option value="Yes">✅ Yes</option>
                      <option value="No">❌ No</option>
                    </select>
                  </div>

                  <div className="divider" />

                  <button className="btn btn-full" onClick={submitFollowUp}>
                    Submit Follow-Up
                  </button>
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
