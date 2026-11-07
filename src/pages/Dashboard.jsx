import { useState } from "react";
import { useCareerTrack } from "../context/CareerTrackContext";

import {
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  Plus,
  ArrowUpRight,
  MapPin,
  Clock3,
  Pencil,
  Trash2
} from "lucide-react";

const createApplicationId = () => {
  if (globalThis.crypto?.randomUUID) {
    return `app-${globalThis.crypto.randomUUID()}`;
  }

  return `app-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

function Dashboard() {
  // Shared application and interview data
  const {
    applications,
    setApplications,
    interviews
  } = useCareerTrack();

  // Form and filter states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const emptyForm = {
    company: "",
    role: "",
    date: "",
    status: "Applied"
  };

  const [formData, setFormData] = useState(emptyForm);

  // Add or update application
  const handleAddApplication = (e) => {
    e.preventDefault();

    const updatedApplication = {
      ...formData,
      company: formData.company.trim(),
      role: formData.role.trim(),
      initials: formData.company.trim().charAt(0).toUpperCase(),
      color: "purple"
    };

    if (editingId !== null) {
      setApplications((prev) =>
        prev.map((app) =>
          app.id === editingId
            ? { ...app, ...updatedApplication }
            : app
        )
      );
    } else {
      setApplications((prev) => [
        ...prev,
        {
          ...updatedApplication,
          id: createApplicationId()
        }
      ]);
    }

    closeForm();
  };

  // Edit application using its permanent ID
  const handleEdit = (app) => {
    setFormData({
      company: app.company || "",
      role: app.role || "",
      date: app.date || "",
      status: app.status || "Applied"
    });

    setEditingId(app.id);
    setShowForm(true);
  };

  // Delete application using its permanent ID
  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (confirmed) {
      setApplications((prev) =>
        prev.filter((app) => app.id !== id)
      );
    }
  };

  // Close and reset form
  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  // Search and filter
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.role || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || app.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Dashboard statistics
  const totalApplications = applications.length;

  const interviewCount = interviews.filter(
    (interview) => interview.status !== "Cancelled"
  ).length;

  const offerCount = applications.filter(
    (app) => app.status === "Offered"
  ).length;

  const respondedCount = applications.filter(
    (app) => app.status !== "Applied"
  ).length;

  const responseRate = totalApplications
    ? Math.round((respondedCount / totalApplications) * 100)
    : 0;

  return (
    <>
      {/* PAGE HEADING */}
      <section className="page-heading">
        <div>
          <p className="welcome">YOUR JOB SEARCH WORKSPACE</p>
          <h1>Welcome back! 👋</h1>
          <p className="subtitle">
            Here's what's happening with your job search.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            closeForm();
            setShowForm(true);
          }}
        >
          <Plus size={18} />
          Add Application
        </button>
      </section>

      {/* STATISTICS */}
      <section className="stats-grid">
        <StatCard
          title="Total Applications"
          value={totalApplications}
          change="All tracked applications"
          icon={<BriefcaseBusiness />}
        />

        <StatCard
          title="Interviews"
          value={String(interviewCount).padStart(2, "0")}
          change="Scheduled and completed interviews"
          icon={<CalendarDays />}
        />

        <StatCard
          title="Offers Received"
          value={String(offerCount).padStart(2, "0")}
          change="Keep going!"
          icon={<ArrowUpRight />}
        />

        <StatCard
          title="Response Rate"
          value={responseRate + "%"}
          change="Applications beyond Applied"
          icon={<ChartNoAxesCombined />}
        />
      </section>

      {/* CONTENT GRID */}
      <section className="content-grid">
        {/* APPLICATIONS TABLE */}
        <div className="panel applications-panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Applications</h2>
              <p>Keep track of your latest opportunities.</p>
            </div>

            <span className="text-btn">
              {totalApplications} Applications
            </span>
          </div>

          {/* SEARCH AND FILTER */}
          <div className="table-controls">
            <input
              type="text"
              placeholder="Search company or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Applied">Applied</option>
              <option value="Assessment">Assessment</option>
              <option value="Interview">Interview</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>COMPANY & ROLE</th>
                  <th>DATE APPLIED</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredApplications.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="company-cell">
                        <div className={`company-logo ${item.color || "purple"}`}>
                          {item.initials || item.company?.charAt(0)}
                        </div>

                        <div>
                          <strong>{item.company}</strong>
                          <small>{item.role}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      {item.date
                        ? new Date(item.date + "T00:00:00").toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric"
                            }
                          )
                        : "—"}
                    </td>

                    <td>
                      <span className={`status ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <div className="row-actions">
                        <button
                          className="action-btn edit-btn"
                          title="Edit application"
                          onClick={() => handleEdit(item)}
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="action-btn delete-btn"
                          title="Delete application"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredApplications.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-state">
                      No applications found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* JOB SEARCH TIPS */}
        <div className="panel activity-panel">
          <h2>Job Search Tips</h2>
          <p>Small steps lead to big opportunities.</p>

          <div className="tip-card">
            <div className="tip-icon">
              <Clock3 />
            </div>

            <strong>Stay consistent</strong>

            <p>
              Try applying to 2–3 relevant opportunities every week.
            </p>
          </div>

          <div className="tip-card">
            <div className="tip-icon">
              <MapPin />
            </div>

            <strong>Track every application</strong>

            <p>
              Keep your recruitment stages and interview dates updated.
            </p>
          </div>

          <div className="progress-box">
            <span>Weekly application goal</span>
            <strong>{Math.min(totalApplications, 5)} / 5</strong>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min((totalApplications / 5) * 100, 100)}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      <footer>
        CareerTrack © 2026 · Built for your next opportunity.
      </footer>

      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-heading">
              <h2>
                {editingId !== null
                  ? "Edit Application"
                  : "Add New Application"}
              </h2>

              <button
                type="button"
                className="close-btn"
                onClick={closeForm}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddApplication}>
              <label>Company Name</label>

              <input
                required
                placeholder="e.g. Google"
                value={formData.company}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    company: e.target.value
                  })
                }
              />

              <label>Job Role</label>

              <input
                required
                placeholder="e.g. Software Engineer Intern"
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value
                  })
                }
              />

              <label>Application Date</label>

              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    date: e.target.value
                  })
                }
              />

              <label>Application Status</label>

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value
                  })
                }
              >
                <option>Applied</option>
                <option>Assessment</option>
                <option>Interview</option>
                <option>Offered</option>
                <option>Rejected</option>
              </select>

              <button
                type="submit"
                className="primary-btn save-btn"
              >
                {editingId !== null
                  ? "Update Application"
                  : "Save Application"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// STAT CARD COMPONENT
function StatCard({ title, value, change, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className="stat-icon">{icon}</div>
      </div>

      <h2>{value}</h2>
      <p>{change}</p>
    </div>
  );
}

export default Dashboard;