import Sidebar from "@/components/Sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 pt-16 lg:pt-0 lg:ml-64 px-4 pb-4 lg:p-6 overflow-auto min-w-0">
        {children}
      </main>
    </div>
  );
}
