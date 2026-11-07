import { useLocation } from "react-router-dom";
import { Search, Bell } from "lucide-react";

function Navbar() {
  const location = useLocation();

  const pageNames = {
    "/": "Dashboard",
    "/applications": "Applications",
    "/interviews": "Interviews",
    "/analytics": "Analytics",
    "/settings": "Settings"
  };

  const currentPage = pageNames[location.pathname] || "Dashboard";

  return (
    <header className="topbar">

      <div className="breadcrumb">
        Workspace / <strong>{currentPage}</strong>
      </div>

      <div className="top-actions">

        <button className="icon-btn" title="Search">
          <Search size={19} />
        </button>

        <button className="icon-btn" title="Notifications">
          <Bell size={19} />
        </button>

        <div className="avatar">S</div>

      </div>

    </header>
  );
}

export default Navbar;