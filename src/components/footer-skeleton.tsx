export function FooterSkeleton() {
  return (
    <div className="flex flex-col justify-center items-center mt-3 space-y-2 w-full animate-pulse">
      <div className="w-3/4 h-3 max-w-[200px] rounded bg-gray-400/30 dark:bg-gray-700" />
      <div className="w-1/2 h-3 max-w-[150px] rounded bg-gray-400/30 dark:bg-gray-700" />
    </div>
  )
}
