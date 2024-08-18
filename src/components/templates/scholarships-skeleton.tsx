import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import { IconBookmark, IconExternalLink } from '../ui/icons'


export const ScholarshipsSkeleton = () => {
  return (
    <div className="-mt-2 flex w-full flex-col gap-2 py-4">
        <Card>
        <CardHeader className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 border-b">
          <CardTitle></CardTitle>
        </CardHeader>
        <CardDescription className='prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 m-5'></CardDescription>
        <CardFooter className="flex items-center justify-between gap-4 border-t pt-4">
            <div className="text-sm prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"></div>
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <IconExternalLink className="h-5 w-5" />
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <IconBookmark className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardFooter>
        </Card>
    </div>
  )
}
