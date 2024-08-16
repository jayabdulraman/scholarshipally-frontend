// const placeholderEvents = [
//   {
//     name: 'Chevening Scholarship for International Students',
//     description:
//       'The Chevening scholarships is for international students seeking postgraduate studies in the UK.',
//     deadline: 'November 2, 2024',
//     source: 'https://www.chevening.org',
//   }
// ]

export const EventsSkeleton = () => {
  return (
    <div className="-mt-2 flex w-full flex-col gap-2 py-4">
        <div
          className="flex shrink-0 flex-col gap-1 rounded-lg bg-zinc-800 p-4"
        >
          <div className="w-fit rounded-md bg-zinc-700 text-sm text-transparent">
          </div>
          <div className="w-fit rounded-md bg-zinc-700 text-transparent">
          </div>
          <div className="w-auto rounded-md bg-zinc-700 text-transparent">
          </div>
          <div className="w-fit rounded-md bg-zinc-700 text-transparent">
          </div>
        </div>
    </div>
  )
}
