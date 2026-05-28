export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full min-h-screen p-8">
      <div className="h-12 w-12 rounded-full border-4 border-[#FFF3EF] border-t-brand-orange animate-spin" />
      <h2 className="mt-6 text-xl font-extrabold text-brand-dark tracking-tight">
        Loading form...
      </h2>
      <p className="mt-2 text-xs font-semibold text-gray-500">
        Preparing assignment creator
      </p>
    </div>
  );
}
