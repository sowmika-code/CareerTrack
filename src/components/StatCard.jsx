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

export default StatCard;