import AdminVerticalNav from "./AdminVerticalNav";
import AdminMobileNav from "./AdminMobileNav";

const i18nNamespaces = ["all"];

interface LayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function EmployeeLayout({ children, params:{locale} }: LayoutProps) {
  return (
    <div className="">
      <AdminVerticalNav />
      <AdminMobileNav/>
      <main className="xs:ml-0 ml-14 sm:ml-16 xs:mt-[3.5rem] xs:mb-20">{children}</main>
    </div>
  );
}
