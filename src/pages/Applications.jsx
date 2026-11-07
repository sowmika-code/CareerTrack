import { useState } from "react";
import { Plus, Pencil, Trash2, BriefcaseBusiness } from "lucide-react";
import { useCareerTrack } from "../context/CareerTrackContext";

const createApplicationId = () => {
  if (globalThis.crypto?.randomUUID) {
    return `app-${globalThis.crypto.randomUUID()}`;
  }

  return `app-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

function Applications() {
  const { applications, setApplications } = useCareerTrack();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    company: "",
    role: "",
    date: "",
    status: "Applied"
  };

  const [formData, setFormData] = useState(emptyForm);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newApplication = {
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
            ? { ...app, ...newApplication }
            : app
        )
      );
    } else {
      setApplications((prev) => [
        ...prev,
        {
          ...newApplication,
          id: createApplicationId()
        }
      ]);
    }

    closeForm();
  };

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

  const handleDelete = (id) => {
    if (window.confirm("Delete this application?")) {
      setApplications((prev) =>
        prev.filter((app) => app.id !== id)
      );
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      (app.company || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.role || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || app.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const interviews = applications.filter(
    (app) => app.status === "Interview"
  ).length;

  const offers = applications.filter(
    (app) => app.status === "Offered"
  ).length;

  return (
    <div className="page-content">

      <div className="page-heading">
        <div>
          <h1>Applications</h1>
          <p className="subtitle">
            Manage and track all your job opportunities.
          </p>
        </div>

        <button
          className="primary-btn"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Add Application
        </button>
      </div>

      <section className="stats-grid">

        <div className="stat-card">
          <div className="stat-top">
            <span>Total Applications</span>
            <BriefcaseBusiness size={19} />
          </div>
          <h2>{applications.length}</h2>
          <p>All tracked opportunities</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Interviews</span>
          </div>
          <h2>{interviews}</h2>
          <p>Interview stage</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Offers Received</span>
          </div>
          <h2>{offers}</h2>
          <p>Successful opportunities</p>
        </div>

      </section>

      <div className="panel applications-panel">

        <div className="panel-heading">
          <div>
            <h2>All Applications</h2>
            <p>
              You have {applications.length} tracked applications.
            </p>
          </div>
        </div>

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

                  <td>{item.date}</td>

                  <td>
                    <span className={`status ${item.status.toLowerCase()}`}>
                      {item.status}
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
              ))}

              {filteredApplications.length === 0 && (
                <tr>
                  <td colSpan="4">
                    <div className="empty-state">
                      {applications.length === 0
                        ? "No applications yet. Add your first opportunity!"
                        : "No matching applications found."}
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

            <form onSubmit={handleSubmit}>

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

    </div>
  );
}

export default Applications;