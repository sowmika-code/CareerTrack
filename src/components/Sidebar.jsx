import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  CalendarDays,
  ChartNoAxesCombined,
  Settings,
  Briefcase
} from "lucide-react";

function Sidebar() {
  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: LayoutDashboard
    },
    {
      name: "Applications",
      path: "/applications",
      icon: BriefcaseBusiness
    },
    {
      name: "Interviews",
      path: "/interviews",
      icon: CalendarDays
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: ChartNoAxesCombined
    }
  ];

  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brand-icon">C</div>
        <span>CareerTrack</span>
      </div>

      <p className="menu-label">WORKSPACE</p>

      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-link ${isActive ? "active" : ""}`
          }
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>

        <div className="profile">
          <div className="avatar">S</div>
          <div>
            <strong>My Workspace</strong>
            <small>Student Account</small>
          </div>
        </div>

      </div>

    </aside>
  );
}

export default Sidebar;