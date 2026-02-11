export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full max-w-md flex-col bg-white shadow-2xl dark:bg-background-dark mx-auto">
      {children}
    </div>
  );
}
