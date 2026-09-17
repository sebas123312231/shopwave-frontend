export default function OrdersLoading() {
  return <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8"><div className="animate-pulse space-y-4"><div className="h-10 w-56 rounded-xl bg-brand-soft" />{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 rounded-2xl bg-brand-soft/60" />)}</div></div>;
}
