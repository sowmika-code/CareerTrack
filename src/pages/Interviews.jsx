import { useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  CalendarDays,
  Clock,
  Video,
  MapPin
} from "lucide-react";

import { useCareerTrack } from "../context/CareerTrackContext";

const getToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const createInterviewId = () =>
  globalThis.crypto?.randomUUID?.() || Date.now().toString();

function Interviews() {
  // Use the shared CareerTrack data
  const { applications, interviews, setInterviews } = useCareerTrack();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [formError, setFormError] = useState("");

  const emptyForm = {
    applicationId: "",
    date: "",
    time: "",
    round: "Technical",
    mode: "Online",
    status: "Scheduled",
    notes: ""
  };

  const [formData, setFormData] = useState(emptyForm);

  // Find an application using its permanent ID
  const getLinkedApplication = (interview) =>
    applications.find((app) => app.id === interview.applicationId);

  // Reset form
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
    setFormError("");
  };

  // Open schedule form
  const openForm = () => {
    if (applications.length === 0) {
      alert("Please add a job application first.");
      return;
    }

    closeForm();
    setShowForm(true);
  };

  // Validate and save interview
  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    const selectedApplication = applications.find(
      (app) => app.id === formData.applicationId
    );

    if (!selectedApplication) {
      setFormError("Please select a valid job application.");
      return;
    }

    if (!formData.date || !formData.time) {
      setFormError("Please enter both interview date and time.");
      return;
    }

    // Scheduled interviews must be in the future
    // Completed interviews can have historical dates
    const interviewDateTime = new Date(
      `${formData.date}T${formData.time}`
    );

    if (
      formData.status === "Scheduled" &&
      interviewDateTime < new Date()
    ) {
      setFormError(
        "A scheduled interview must have a future date and time."
      );
      return;
    }

    // Prevent duplicate interview bookings
    const duplicate = interviews.some(
      (item) =>
        item.id !== editingId &&
        item.applicationId === formData.applicationId &&
        item.date === formData.date &&
        item.time === formData.time &&
        item.round === formData.round &&
        item.status !== "Cancelled"
    );

    if (duplicate) {
      setFormError(
        "An interview for this application, date, time and round already exists."
      );
      return;
    }

    const interviewData = {
      ...formData,
      id: editingId || createInterviewId(),
      company: selectedApplication.company,
      role: selectedApplication.role
    };

    if (editingId) {
      setInterviews((prev) =>
        prev.map((item) =>
          item.id === editingId ? interviewData : item
        )
      );
    } else {
      setInterviews((prev) => [...prev, interviewData]);
    }

    closeForm();
  };

  // Edit interview
  const handleEdit = (interview) => {
    let selectedApplication = getLinkedApplication(interview);

    // Compatibility with older interview records
    // that may not have an applicationId
    if (!selectedApplication && interview.applicationKey) {
      selectedApplication = applications.find((app) => {
        const key = JSON.stringify([
          app.company?.trim().toLowerCase(),
          app.role?.trim().toLowerCase(),
          app.date || ""
        ]);

        return key === interview.applicationKey;
      });
    }

    if (!selectedApplication && interview.applicationIndex !== undefined) {
      selectedApplication =
        applications[Number(interview.applicationIndex)];
    }

    if (!selectedApplication) {
      alert(
        "The original job application could not be found. Please select a current application instead."
      );
      return;
    }

    setFormData({
      applicationId: selectedApplication.id,
      date: interview.date || "",
      time: interview.time || "",
      round: interview.round || "Technical",
      mode: interview.mode || "Online",
      status: interview.status || "Scheduled",
      notes: interview.notes || ""
    });

    setEditingId(interview.id);
    setFormError("");
    setShowForm(true);
  };

  // Delete interview
  const handleDelete = (id) => {
    if (window.confirm("Delete this interview?")) {
      setInterviews((prev) =>
        prev.filter((item) => item.id !== id)
      );
    }
  };

  // Statistics
  const today = getToday();

  const upcoming = interviews.filter(
    (item) =>
      item.status === "Scheduled" &&
      item.date >= today
  ).length;

  const completed = interviews.filter(
    (item) => item.status === "Completed"
  ).length;

  const cancelled = interviews.filter(
    (item) => item.status === "Cancelled"
  ).length;

  // Filter and sort without mutating shared state
  const filteredInterviews = [...interviews]
    .filter(
      (item) =>
        filterStatus === "All" ||
        item.status === filterStatus
    )
    .sort((a, b) =>
      `${a.date} ${a.time}`.localeCompare(
        `${b.date} ${b.time}`
      )
    );

  return (
    <div className="page-content">

      <div className="page-heading">
        <div>
          <h1>Interviews</h1>
          <p className="subtitle">
            Schedule and manage your job interviews.
          </p>
        </div>

        <button className="primary-btn" onClick={openForm}>
          <Plus size={18} />
          Schedule Interview
        </button>
      </div>

      <section className="stats-grid">

        <div className="stat-card">
          <div className="stat-top">
            <span>Upcoming Interviews</span>
            <CalendarDays size={19} />
          </div>
          <h2>{upcoming}</h2>
          <p>Scheduled interviews</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Completed</span>
            <Clock size={19} />
          </div>
          <h2>{completed}</h2>
          <p>Interviews completed</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Cancelled</span>
          </div>
          <h2>{cancelled}</h2>
          <p>Cancelled interviews</p>
        </div>

      </section>

      <div className="panel applications-panel">

        <div className="panel-heading">
          <div>
            <h2>Interview Schedule</h2>
            <p>
              You have {interviews.length} tracked interviews.
            </p>
          </div>
        </div>

        <div className="table-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Interviews</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>COMPANY & ROLE</th>
                <th>DATE & TIME</th>
                <th>ROUND</th>
                <th>MODE</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {filteredInterviews.map((item) => {
                // Show the latest application details when available.
                // Fall back to saved details if the application was deleted.
                const linkedApplication = getLinkedApplication(item);

                const company =
                  linkedApplication?.company || item.company || "Unknown Company";

                const role =
                  linkedApplication?.role || item.role || "Unknown Role";

                return (
                  <tr key={item.id}>
                    <td>
                      <div className="company-cell">
                        <div className="company-logo purple">
                          {company.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{company}</strong>
                          <small>{role}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong>{item.date}</strong>
                      <small>{item.time}</small>
                    </td>

                    <td>{item.round}</td>

                    <td>
                      {item.mode === "Online" ? (
                        <Video size={16} />
                      ) : (
                        <MapPin size={16} />
                      )}
                      {" "}{item.mode}
                    </td>

                    <td>
                      <span className={`status ${(item.status || "Scheduled").toLowerCase()}`}>
                        {item.status || "Scheduled"}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(item)}
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredInterviews.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state">
                      {interviews.length === 0
                        ? applications.length === 0
                          ? "Add a job application first to start scheduling interviews."
                          : "No interviews scheduled yet. Schedule your first interview!"
                        : "No interviews found for this status."}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">

            <div className="modal-heading">
              <h2>
                {editingId ? "Edit Interview" : "Schedule Interview"}
              </h2>

              <button
                type="button"
                className="close-btn"
                onClick={closeForm}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <label>Job Application</label>
              <select
                required
                value={formData.applicationId}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    applicationId: e.target.value
                  });
                  setFormError("");
                }}
              >
                <option value="">Select a company</option>

                {applications.map((app) => (
                  <option
                    key={app.id}
                    value={app.id}
                  >
                    {app.company} — {app.role}
                  </option>
                ))}
              </select>

              <label>Interview Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    date: e.target.value
                  });
                  setFormError("");
                }}
              />

              <label>Interview Time</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    time: e.target.value
                  });
                  setFormError("");
                }}
              />

              <label>Interview Round</label>
              <select
                value={formData.round}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    round: e.target.value
                  })
                }
              >
                <option>Technical</option>
                <option>HR</option>
                <option>Managerial</option>
                <option>Online Assessment</option>
                <option>Final Round</option>
              </select>

              <label>Interview Mode</label>
              <select
                value={formData.mode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    mode: e.target.value
                  })
                }
              >
                <option>Online</option>
                <option>Offline</option>
              </select>

              <label>Interview Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value
                  })
                }
              >
                <option>Scheduled</option>
                <option>Completed</option>
                <option>Cancelled</option>
              </select>

              <label>Notes / Feedback</label>
              <textarea
                rows="3"
                placeholder="Add interview preparation notes or feedback..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    notes: e.target.value
                  })
                }
              />

              {formError && (
                <p
                  role="alert"
                  style={{
                    color: "#d45e65",
                    fontSize: "12px",
                    margin: "5px 0"
                  }}
                >
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="primary-btn save-btn"
              >
                {editingId ? "Update Interview" : "Save Interview"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Interviews;