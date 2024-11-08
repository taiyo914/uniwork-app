"use client";

import DashboardStats from "./dashboard/DashboardStats";
import Sections from "./dashboard/Sections";

export default function EmployeeDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <DashboardStats />
      <Sections />
    </div>
  );
}
