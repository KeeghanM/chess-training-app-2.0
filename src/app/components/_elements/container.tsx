export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-[min(calc(100vw-2rem),90ch)] p-4 md:p-6 lg:p-8">
      {children}
    </div>
  );
}
