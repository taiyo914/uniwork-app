import VerticalNav from "@/app/employee/[locale]/VerticalNav";
import initTranslations from "@/app/i18n"
import TranslationsProvider from "@/components/TranslationProvider";

const i18nNamespaces = ["all"];

interface LayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function EmployeeLayout({ children, params:{locale} }: LayoutProps) {
  const { t, resources } = await initTranslations(locale, i18nNamespaces);
  return (
    <TranslationsProvider namespaces={i18nNamespaces} locale={locale} resources={resources}>
      <div className="flex h-screen overflow-hidden">
        <VerticalNav />
        <main className="flex-1 overflow-auto ml-16 p-4">{children}</main>
      </div>
    </TranslationsProvider>
  );
}
