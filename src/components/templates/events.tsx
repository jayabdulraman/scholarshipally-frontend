import { format, parseISO } from 'date-fns'

interface Event {
  name: string
  description: string
  deadline: string
  source: string
}

export function Events({ props: events }: { props: Event[] }) {
  //console.log("Scholarships:", events);
  return (
    <div className="-mt-2 flex w-full flex-col gap-2 py-4">
      {events.map(event => (
        <div
          key={event.name}
          className="flex shrink-0 flex-col gap-1 rounded-lg bg-zinc-800 p-4"
        >
          <div className="text-sm text-zinc-400">
            Potential Deadline: {event.deadline}
          </div>
          <div className="text-base font-bold text-zinc-200">
            {event.name}
          </div>
          <div className="text-zinc-500">
            {event.description}
          </div>
          <div className="text-zinc-500">
            <a href={event.source} target='_blank'>Learn more</a>
          </div>
        </div>
      ))}
    </div>
  )
}
