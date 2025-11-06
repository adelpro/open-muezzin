export function PrayerTimesSkeleton() {
  return (
    <div className="p-4 mx-auto w-full max-w-md text-gray-900 bg-white rounded-2xl border border-gray-200 shadow-lg dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100">
      <ul className="divide-y divide-gray-100 dark:divide-gray-800">
        {[...Array(6)].map((_, index) => (
          <li
            key={index}
            className="flex justify-between items-center px-3 py-3 rounded-xl animate-pulse">
            {/* Left side — icon + label */}
            <div className="flex gap-2 items-center w-20">
              <div className="w-5 h-5 rounded-full bg-gray-400/30" />
              <div className="w-14 h-4 rounded bg-gray-400/30" />
            </div>

            {/* Middle — timer badge placeholder for the fist line only*/}
            {/*             {index === 0 && (
              <div className="flex flex-1 justify-center">
                <div className="w-20 h-5 rounded-full bg-gray-400/20" />
              </div>
            )} */}

            {/* Right — time placeholder */}
            <div className="w-16 h-4 rounded bg-gray-400/30" />
          </li>
        ))}
      </ul>
    </div>
  )
}
