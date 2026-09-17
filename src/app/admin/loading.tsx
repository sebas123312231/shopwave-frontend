export default function AdminLoading() {
  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"><div className="animate-pulse space-y-5"><div className="h-10 w-72 rounded-xl bg-brand-soft" /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-32 rounded-2xl bg-brand-soft/60" />)}</div></div></div>;
}
