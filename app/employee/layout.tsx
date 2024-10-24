import VerticalNav from "@/app/employee/VerticalNav";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <VerticalNav />
      <main className="flex-1 overflow-auto ml-16 p-4">{children}</main>
    </div>
  );
}
