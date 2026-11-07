import { useEffect, useState } from "react";
import {
  User,
  Palette,
  Download,
  Trash2,
  Save,
  Sun,
  Moon,
  ShieldCheck
} from "lucide-react";

const readStorage = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

function Settings() {
  const [profile, setProfile] = useState(() =>
    readStorage("careertrack-profile", {
      name: "",
      email: "",
      targetRole: ""
    })
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem("careertrack-theme") || "light"
  );

  const [message, setMessage] = useState("");

  // APPLY AND SAVE THEME
  useEffect(() => {
    document.body.classList.toggle(
      "dark-theme",
      theme === "dark"
    );

    localStorage.setItem("careertrack-theme", theme);
  }, [theme]);

  // SAVE PROFILE
  const handleProfileSave = (e) => {
    e.preventDefault();

    if (!profile.name.trim()) {
      setMessage("Please enter your name.");
      return;
    }

    try {
      localStorage.setItem(
        "careertrack-profile",
        JSON.stringify({
          name: profile.name.trim(),
          email: profile.email.trim(),
          targetRole: profile.targetRole.trim()
        })
      );

      setMessage("Profile saved successfully!");
    } catch {
      setMessage("Unable to save profile. Please try again.");
    }
  };

  // SAFE CSV EXPORT
  const exportCSV = (data, filename, headers) => {
    if (!Array.isArray(data) || data.length === 0) {
      setMessage("No data available to export.");
      return;
    }

    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const rows = [
      headers,
      ...data.map((item) =>
        headers.map((header) => item[header] ?? "")
      )
    ];

    const csvContent = rows
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    // Release the temporary download URL after the click.
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setMessage(`${filename} exported successfully!`);
  };

  const exportApplications = () => {
    const data = readStorage("careertrack-applications", []);

    exportCSV(
      data,
      "CareerTrack-Applications.csv",
      ["company", "role", "date", "status"]
    );
  };

  const exportInterviews = () => {
    const data = readStorage("careertrack-interviews", []);

    exportCSV(
      data,
      "CareerTrack-Interviews.csv",
      [
        "company",
        "role",
        "date",
        "time",
        "round",
        "mode",
        "status",
        "notes"
      ]
    );
  };

  // RESET APPLICATION AND INTERVIEW DATA
  const handleReset = () => {
    const confirmed = window.confirm(
      "Are you sure? This will permanently delete all your applications and interviews from this browser. Your profile and theme will remain."
    );

    if (!confirmed) return;

    localStorage.removeItem("careertrack-applications");
    localStorage.removeItem("careertrack-interviews");

    setMessage("Application and interview data cleared.");

    // Refresh other pages and dashboard statistics.
    window.location.reload();
  };

  const cardStyle = {
    background: "var(--card-bg, #ffffff)",
    border: "1px solid var(--border-color, #e5e7eb)",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px"
  };

  const sectionHeading = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px"
  };

  const description = {
    color: "var(--muted-text, #6b7280)",
    marginBottom: "20px"
  };

  const actionButton = {
    padding: "10px 16px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    background: "transparent",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 600
  };

  return (
    <div className="page-content">

      {/* PAGE HEADING */}
      <div className="page-heading">
        <div>
          <h1>Settings</h1>
          <p className="subtitle">
            Manage your CareerTrack workspace preferences.
          </p>
        </div>
      </div>

      {/* FEEDBACK MESSAGE */}
      {message && (
        <p
          role="status"
          style={{
            color: message.includes("successfully") ||
              message.includes("cleared")
              ? "#16a34a"
              : "#ef4444",
            marginBottom: "15px"
          }}
        >
          {message}
        </p>
      )}

      {/* PROFILE SETTINGS */}
      <section style={cardStyle}>

        <div style={sectionHeading}>
          <User size={21} />
          <h2>Profile Settings</h2>
        </div>

        <p style={description}>
          Manage your personal CareerTrack profile.
        </p>

        <form onSubmit={handleProfileSave}>

          <label htmlFor="profile-name">Full Name</label>
          <input
            id="profile-name"
            type="text"
            placeholder="Enter your name"
            value={profile.name}
            onChange={(e) =>
              setProfile({ ...profile, name: e.target.value })
            }
            required
          />

          <label htmlFor="profile-email">Email Address</label>
          <input
            id="profile-email"
            type="email"
            placeholder="Enter your email"
            value={profile.email}
            onChange={(e) =>
              setProfile({ ...profile, email: e.target.value })
            }
          />

          <label htmlFor="profile-role">Target Job Role</label>
          <input
            id="profile-role"
            type="text"
            placeholder="e.g. Frontend Developer"
            value={profile.targetRole}
            onChange={(e) =>
              setProfile({ ...profile, targetRole: e.target.value })
            }
          />

          <button
            type="submit"
            className="primary-btn save-btn"
          >
            <Save size={17} />
            Save Profile
          </button>

        </form>
      </section>

      {/* APPEARANCE SETTINGS */}
      <section style={cardStyle}>

        <div style={sectionHeading}>
          <Palette size={21} />
          <h2>Appearance</h2>
        </div>

        <p style={description}>
          Customize how CareerTrack looks.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>

          <button
            type="button"
            onClick={() => setTheme("light")}
            style={{
              ...actionButton,
              background: theme === "light" ? "#6366f1" : "transparent",
              color: theme === "light" ? "white" : "inherit"
            }}
          >
            <Sun size={18} />
            Light Mode
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            style={{
              ...actionButton,
              background: theme === "dark" ? "#6366f1" : "transparent",
              color: theme === "dark" ? "white" : "inherit"
            }}
          >
            <Moon size={18} />
            Dark Mode
          </button>

        </div>

        <p style={{ marginTop: "15px", fontSize: "13px" }}>
          Current theme: <strong>{theme}</strong>
        </p>

      </section>

      {/* DATA EXPORT */}
      <section style={cardStyle}>

        <div style={sectionHeading}>
          <Download size={21} />
          <h2>Export Your Data</h2>
        </div>

        <p style={description}>
          Download your CareerTrack records as CSV files.
          You can open them using Excel or Google Sheets.
        </p>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>

          <button
            type="button"
            style={actionButton}
            onClick={exportApplications}
          >
            <Download size={17} />
            Export Applications
          </button>

          <button
            type="button"
            style={actionButton}
            onClick={exportInterviews}
          >
            <Download size={17} />
            Export Interviews
          </button>

        </div>

      </section>

      {/* DATA MANAGEMENT */}
      <section style={cardStyle}>

        <div style={sectionHeading}>
          <ShieldCheck size={21} />
          <h2>Data Management</h2>
        </div>

        <p style={description}>
          Manage the information stored in this browser.
        </p>

        <div
          style={{
            border: "1px solid #ef4444",
            borderRadius: "10px",
            padding: "16px"
          }}
        >
          <div style={sectionHeading}>
            <Trash2 color="#ef4444" size={20} />
            <strong>Reset CareerTrack Data</strong>
          </div>

          <p style={description}>
            This deletes all saved applications and interview records.
            Your profile and appearance preferences will remain.
          </p>

          <button
            type="button"
            onClick={handleReset}
            style={{
              ...actionButton,
              color: "#ef4444",
              borderColor: "#ef4444"
            }}
          >
            <Trash2 size={17} />
            Reset All Data
          </button>
        </div>

      </section>

      {/* FOOTER */}
      <p className="subtitle" style={{ textAlign: "center" }}>
        CareerTrack © 2026 · Settings & Preferences
      </p>

    </div>
  );
}

export default Settings;