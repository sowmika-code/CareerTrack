import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

const readStorage = (key) => {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const COLORS = {
  Applied: "#6366f1",
  Assessment: "#f59e0b",
  Interview: "#0ea5e9",
  Offered: "#22c55e",
  Rejected: "#ef4444"
};

const normalizeStatus = (status) => {
  return status === "Offer" ? "Offered" : status;
};

function Analytics() {
  const [applications, setApplications] = useState(() =>
    readStorage("careertrack-applications")
  );

  const [interviews, setInterviews] = useState(() =>
    readStorage("careertrack-interviews")
  );

  // REFRESH DATA WHEN RETURNING TO THE PAGE
  useEffect(() => {
    const refreshData = () => {
      setApplications(readStorage("careertrack-applications"));
      setInterviews(readStorage("careertrack-interviews"));
    };

    window.addEventListener("focus", refreshData);
    window.addEventListener("storage", refreshData);

    return () => {
      window.removeEventListener("focus", refreshData);
      window.removeEventListener("storage", refreshData);
    };
  }, []);

  // NORMALIZE APPLICATION STATUSES
  const normalizedApplications = applications.map((app) => ({
    ...app,
    status: normalizeStatus(app.status)
  }));

  // APPLICATION STATISTICS
  const totalApplications = applications.length;

  const offers = normalizedApplications.filter(
    (app) => app.status === "Offered"
  ).length;

  const responded = normalizedApplications.filter((app) =>
    ["Assessment", "Interview", "Offered", "Rejected"].includes(app.status)
  ).length;

  const activeApplications = normalizedApplications.filter((app) =>
    ["Applied", "Assessment", "Interview"].includes(app.status)
  ).length;

  const responseRate = totalApplications
    ? Math.round((responded / totalApplications) * 100)
    : 0;

  const successRate = totalApplications
    ? Math.round((offers / totalApplications) * 100)
    : 0;

  // APPLICATION STATUS PIE CHART
  const statuses = [
    "Applied",
    "Assessment",
    "Interview",
    "Offered",
    "Rejected"
  ];

  const statusData = statuses
    .map((status) => ({
      name: status,
      value: normalizedApplications.filter(
        (app) => app.status === status
      ).length
    }))
    .filter((item) => item.value > 0);

  // APPLICATION TREND - LAST SIX MONTHS
  const now = new Date();

  const trendData = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      now.getFullYear(),
      now.getMonth() - (5 - index),
      1
    );

    const month = date.toLocaleDateString("en-US", {
      month: "short"
    });

    const count = applications.filter((app) => {
      if (!app.date) return false;

      const appDate = new Date(app.date + "T00:00:00");

      if (Number.isNaN(appDate.getTime())) return false;

      return (
        appDate.getMonth() === date.getMonth() &&
        appDate.getFullYear() === date.getFullYear()
      );
    }).length;

    return {
      month,
      applications: count
    };
  });

  const hasTrendData = trendData.some(
    (item) => item.applications > 0
  );

  // INTERVIEW STATISTICS
  const interviewData = [
    {
      name: "Scheduled",
      count: interviews.filter(
        (item) => item.status === "Scheduled"
      ).length
    },
    {
      name: "Completed",
      count: interviews.filter(
        (item) => item.status === "Completed"
      ).length
    },
    {
      name: "Cancelled",
      count: interviews.filter(
        (item) => item.status === "Cancelled"
      ).length
    }
  ];

  const hasInterviewData = interviews.length > 0;

  // COMMON CARD STYLES
  const cardStyle = {
    background: "var(--card-bg, #ffffff)",
    border: "1px solid var(--border-color, #e5e7eb)",
    borderRadius: "14px",
    padding: "20px",
    minWidth: 0
  };

  const chartStyle = {
    ...cardStyle,
    minHeight: "350px"
  };

  const chartHeight = {
    width: "100%",
    height: 260
  };

  const emptyStyle = {
    padding: "65px 15px",
    textAlign: "center",
    color: "var(--text-secondary, #888)",
    fontSize: "14px"
  };

  return (
    <div className="page-content">

      {/* PAGE HEADING */}
      <div className="page-heading">
        <div>
          <h1>Analytics</h1>
          <p className="subtitle">
            Understand your job search performance and progress.
          </p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <section className="stats-grid">

        <div className="stat-card">
          <div className="stat-top">
            <span>Total Applications</span>
          </div>
          <h2>{totalApplications}</h2>
          <p>All tracked opportunities</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Total Interviews</span>
          </div>
          <h2>{interviews.length}</h2>
          <p>All tracked interview records</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Offers Received</span>
          </div>
          <h2>{offers}</h2>
          <p>Successful opportunities</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Response Rate</span>
          </div>
          <h2>{responseRate}%</h2>
          <p>Applications beyond Applied</p>
        </div>

      </section>

      {/* ACTIVE PIPELINE */}
      <section
        style={{
          ...cardStyle,
          marginTop: "20px"
        }}
      >
        <div className="stat-top">
          <span>Active Application Pipeline</span>
        </div>

        <h2 style={{ margin: "12px 0 5px" }}>
          {activeApplications}
        </h2>

        <p className="subtitle">
          Applications currently Applied, in Assessment, or in Interview.
        </p>
      </section>

      {/* CHARTS GRID */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 350px), 1fr))",
          gap: "20px",
          marginTop: "24px"
        }}
      >

        {/* APPLICATION STATUS */}
        <div style={chartStyle}>
          <h2>Applications by Status</h2>
          <p className="subtitle">
            Breakdown of your application pipeline.
          </p>

          {statusData.length > 0 ? (
            <div style={chartHeight}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={85}
                    label
                  >
                    {statusData.map((item) => (
                      <Cell
                        key={item.name}
                        fill={COLORS[item.name]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={emptyStyle}>
              No applications yet. Add applications to see your breakdown.
            </p>
          )}
        </div>

        {/* APPLICATION TREND */}
        <div style={chartStyle}>
          <h2>Application Trends</h2>
          <p className="subtitle">
            Applications submitted over the last six months.
          </p>

          {hasTrendData ? (
            <div style={chartHeight}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />

                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={emptyStyle}>
              Application activity will appear here once you start tracking
              submissions from the last six months.
            </p>
          )}
        </div>

        {/* INTERVIEW STATISTICS */}
        <div style={chartStyle}>
          <h2>Interview Statistics</h2>
          <p className="subtitle">
            Your interview progress by status.
          </p>

          {hasInterviewData ? (
            <div style={chartHeight}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={interviewData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />

                  <Bar
                    dataKey="count"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p style={emptyStyle}>
              No interviews scheduled yet. Your interview statistics will
              appear here.
            </p>
          )}
        </div>

        {/* SUCCESS RATE */}
        <div style={chartStyle}>
          <h2>Success Overview</h2>
          <p className="subtitle">
            Your offer conversion progress.
          </p>

          <div style={{ padding: "30px 10px" }}>
            <h1 style={{ fontSize: "48px", margin: "10px 0" }}>
              {successRate}%
            </h1>

            <p className="subtitle">
              Offer conversion rate
            </p>

            <div
              style={{
                background: "#e5e7eb",
                height: "12px",
                borderRadius: "20px",
                overflow: "hidden",
                margin: "25px 0"
              }}
            >
              <div
                style={{
                  width: `${successRate}%`,
                  height: "100%",
                  background: "#22c55e",
                  borderRadius: "20px",
                  transition: "width 0.3s ease"
                }}
              />
            </div>

            <p>
              <strong>{offers}</strong> offers from{" "}
              <strong>{totalApplications}</strong> applications.
            </p>
          </div>
        </div>

      </section>

      {/* FOOTER */}
      <div style={{ marginTop: "25px", textAlign: "center" }}>
        <p className="subtitle">
          CareerTrack Analytics · Your job search at a glance.
        </p>
      </div>

    </div>
  );
}

export default Analytics;