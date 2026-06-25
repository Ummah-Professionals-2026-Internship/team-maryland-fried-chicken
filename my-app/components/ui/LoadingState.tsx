type LoadingStateProps = {
  title?: string;
  description?: string;
  variant?: "directory" | "profile";
};

function SkeletonLine({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-slate-200 ${className}`} />;
}

function DirectorySkeleton() {
  return (
    <div className="space-y-4">
      <div className="hidden grid-cols-12 gap-4 px-4 md:grid">
        <SkeletonLine className="col-span-3 h-3" />
        <SkeletonLine className="col-span-2 h-3" />
        <SkeletonLine className="col-span-3 h-3" />
        <SkeletonLine className="col-span-2 h-3" />
        <SkeletonLine className="col-span-2 h-3" />
      </div>

      {[1, 2, 3].map((section) => (
        <div
          key={section}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <SkeletonLine className="h-4 w-32" />
          </div>

          {[1, 2].map((row) => (
            <div
              key={row}
              className="grid gap-4 border-b border-slate-200 px-4 py-3.5 last:border-0 md:grid-cols-12 md:items-center"
            >
              <div className="flex items-center gap-2.5 md:col-span-3">
                <SkeletonLine className="h-8 w-8 rounded-full" />
                <SkeletonLine className="h-4 w-32" />
              </div>

              <SkeletonLine className="h-4 w-36 md:col-span-2" />
              <SkeletonLine className="h-4 w-40 md:col-span-3" />
              <SkeletonLine className="h-6 w-32 md:col-span-2" />
              <SkeletonLine className="h-6 w-20 md:col-span-2" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-start gap-4">
          <SkeletonLine className="h-14 w-14 rounded-full" />

          <div className="flex-1 space-y-3">
            <SkeletonLine className="h-5 w-44" />
            <SkeletonLine className="h-4 w-64" />
            <div className="flex flex-wrap gap-2">
              <SkeletonLine className="h-7 w-24 rounded-full" />
              <SkeletonLine className="h-7 w-20 rounded-full" />
              <SkeletonLine className="h-7 w-40 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <SkeletonLine className="mb-3 h-4 w-40" />
        <SkeletonLine className="h-2 w-full rounded-full" />
        <SkeletonLine className="mt-2 h-3 w-44" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((card) => (
          <div
            key={card}
            className="rounded-xl border border-slate-200 bg-white px-5 py-4"
          >
            <SkeletonLine className="mb-4 h-3 w-28" />
            <div className="space-y-4">
              <SkeletonLine className="h-4 w-full" />
              <SkeletonLine className="h-4 w-3/4" />
              <SkeletonLine className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LoadingState({
  title = "Loading",
  description = "Please wait while this page loads.",
  variant = "directory",
}: LoadingStateProps) {
  return (
    <section className="w-full max-w-[1100px] mx-auto space-y-4">
      <div>
        <h1
          className="text-zinc-900"
          style={{ fontSize: "1.375rem", fontWeight: 700 }}
        >
          {title}
        </h1>
        <p className="mt-0.5 text-sm text-slate-600">{description}</p>
      </div>

      {variant === "profile" ? <ProfileSkeleton /> : <DirectorySkeleton />}
    </section>
  );
}
