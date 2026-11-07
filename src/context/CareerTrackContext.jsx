import { createContext, useContext, useEffect, useState } from "react";

const CareerTrackContext = createContext(null);

const initialApplications = [
  {
    company: "Google",
    role: "Software Engineering Intern",
    date: "2026-11-02",
    status: "Interview",
    color: "purple",
    initials: "G"
  },
  {
    company: "Microsoft",
    role: "Frontend Developer Intern",
    date: "2026-11-01",
    status: "Applied",
    color: "blue",
    initials: "M"
  },
  {
    company: "Amazon",
    role: "SDE Intern",
    date: "2026-10-29",
    status: "Assessment",
    color: "orange",
    initials: "A"
  },
  {
    company: "Infosys",
    role: "System Engineer",
    date: "2026-10-26",
    status: "Rejected",
    color: "green",
    initials: "I"
  }
];

const createId = (prefix) => {
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

const readArray = (key) => {
  try {
    const saved = localStorage.getItem(key);
    const parsed = saved ? JSON.parse(saved) : null;

    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const getApplicationKey = (app) =>
  JSON.stringify([
    app.company?.trim().toLowerCase(),
    app.role?.trim().toLowerCase(),
    app.date || ""
  ]);

const normalizeApplications = (savedApplications) => {
  const usedIds = new Set();

  return savedApplications.map((app) => {
    let id = app.id ? String(app.id) : createId("app");

    while (usedIds.has(id)) {
      id = createId("app");
    }

    usedIds.add(id);

    return {
      ...app,
      id,
      initials:
        app.initials ||
        app.company?.charAt(0)?.toUpperCase() ||
        "?",
      color: app.color || "purple"
    };
  });
};

const normalizeInterviews = (savedInterviews, applications) => {
  const usedIds = new Set();

  return savedInterviews.map((interview) => {
    let id = interview.id
      ? String(interview.id)
      : createId("interview");

    while (usedIds.has(id)) {
      id = createId("interview");
    }

    usedIds.add(id);

    let linkedApplication = applications.find(
      (app) => app.id === interview.applicationId
    );

    // Migrate interviews that used the old applicationKey.
    if (!linkedApplication && interview.applicationKey) {
      linkedApplication = applications.find(
        (app) =>
          getApplicationKey(app) === interview.applicationKey
      );
    }

    // Migrate older records that stored an application index.
    if (
      !linkedApplication &&
      interview.applicationIndex !== undefined
    ) {
      linkedApplication =
        applications[Number(interview.applicationIndex)];
    }

    // Last fallback: link only if company and role match uniquely.
    if (!linkedApplication && interview.company && interview.role) {
      const matches = applications.filter(
        (app) =>
          app.company?.trim().toLowerCase() ===
            interview.company.trim().toLowerCase() &&
          app.role?.trim().toLowerCase() ===
            interview.role.trim().toLowerCase()
      );

      if (matches.length === 1) {
        linkedApplication = matches[0];
      }
    }

    return {
      ...interview,
      id,
      applicationId: linkedApplication?.id || null,
      applicationKey: linkedApplication
        ? getApplicationKey(linkedApplication)
        : interview.applicationKey || "",
      company: linkedApplication?.company || interview.company || "",
      role: linkedApplication?.role || interview.role || ""
    };
  });
};

export function CareerTrackProvider({ children }) {
  const [applications, setApplications] = useState(() => {
    const saved = readArray("careertrack-applications");

    return normalizeApplications(
      saved === null ? initialApplications : saved
    );
  });

  const [interviews, setInterviews] = useState(() => {
    const saved = readArray("careertrack-interviews");

    return normalizeInterviews(saved || [], applications);
  });

  // Keep shared data saved in LocalStorage.
  useEffect(() => {
    localStorage.setItem(
      "careertrack-applications",
      JSON.stringify(applications)
    );
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(
      "careertrack-interviews",
      JSON.stringify(interviews)
    );
  }, [interviews]);

  return (
    <CareerTrackContext.Provider
      value={{
        applications,
        setApplications,
        interviews,
        setInterviews
      }}
    >
      {children}
    </CareerTrackContext.Provider>
  );
}

export function useCareerTrack() {
  const context = useContext(CareerTrackContext);

  if (!context) {
    throw new Error(
      "useCareerTrack must be used inside CareerTrackProvider"
    );
  }

  return context;
}