import { format, parseISO } from 'date-fns'
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { IconBookmark, IconExternalLink } from '../ui/icons'

interface Scholarship {
  name: string
  description: string
  deadline: string
  source: string
}

export function Scholarships({ props: scholarships }: { props: Scholarship[] }) {
  //console.log("Scholarships:", events);
  return (
    <div className="-mt-2 flex w-full flex-col gap-2 py-4">
      {/* {scholarships.map(scholarship => (
        <div
          key={scholarship.name}
          className="flex shrink-0 flex-col gap-1 rounded-lg bg-zinc-800 p-4"
        >
          <div className="text-sm text-zinc-400">
            Potential Deadline: {scholarship.deadline}
          </div>
          <div className="text-base font-bold text-zinc-200">
            {scholarship.name}
          </div>
          <div className="text-zinc-500">
            {scholarship.description}
          </div>
          <div className="text-zinc-500">
            <a href={scholarship.source} target='_blank'>Learn more</a>
          </div>
        </div>
      ))} */}
      <>
      {scholarships.map(scholarship => (
      <Card key={scholarship.name}>
        <CardHeader className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 border-b">
          <CardTitle>{scholarship.name}</CardTitle>
        </CardHeader>
        <CardDescription className='prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 m-5'>{scholarship.description}</CardDescription>
        <CardFooter className="flex items-center justify-between gap-4 border-t pt-4">
            <div className="text-sm prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0">Potential Deadline: {scholarship.deadline}</div>
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a href={scholarship.source} target='_blank'>
                      <Button variant="ghost" size="icon">
                        <IconExternalLink className="h-5 w-5" />
                      </Button>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>Learn more</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <IconBookmark className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Coming soon</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardFooter>
        </Card>
        ))}
        <div className="p-4 text-center text-sm text-zinc-500">
          Note: Some external links are broken. In such a case, use Google search for more current information!
        </div>
      </>
    </div>
  )
}
