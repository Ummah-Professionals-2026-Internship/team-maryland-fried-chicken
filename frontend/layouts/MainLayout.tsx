import TopNavigation from "@/components/navigation/TopNavigation";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <TopNavigation />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
