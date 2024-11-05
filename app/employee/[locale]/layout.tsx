import VerticalNav from "@/app/employee/[locale]/VerticalNav";
import initTranslations from "@/app/i18n"
import TranslationsProvider from "@/components/TranslationProvider";
import MobileNav from "./MobileNav";

const i18nNamespaces = ["all"];

interface LayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function EmployeeLayout({ children, params:{locale} }: LayoutProps) {
  const { resources } = await initTranslations(locale, i18nNamespaces);
  return (
    <TranslationsProvider namespaces={i18nNamespaces} locale={locale} resources={resources}>
      <div className="">
        <VerticalNav />
        <MobileNav/>
        <main className="notxs:pl-16 xs:pt-[3.5rem] xs:pb-20">{children}</main>
      </div>
    </TranslationsProvider>
  );
}
