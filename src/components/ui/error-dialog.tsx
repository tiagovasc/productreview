import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ApiLog } from "@/types/product";

interface ErrorDialogProps {
  logs: ApiLog[];
}

export function ErrorDialog({ logs }: ErrorDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto font-normal">
          here
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Error Details</AlertDialogTitle>
          <AlertDialogDescription>
            The following error occurred while processing your request:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4">
          <div className="space-y-4">
            {logs.map((log, index) => (
              <div key={index} className="space-y-2">
                <div className="font-medium">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
                {log.error && (
                  <div className="text-destructive">
                    Error: {log.error.message}
                    {log.error.stack && (
                      <pre className="mt-2 whitespace-pre-wrap text-xs">
                        {log.error.stack}
                      </pre>
                    )}
                  </div>
                )}
                <div className="text-sm">
                  <div>Type: {log.type}</div>
                  <div>Endpoint: {log.endpoint}</div>
                  <div className="mt-2">
                    <strong>Request:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-xs">
                      {JSON.stringify(log.request, null, 2)}
                    </pre>
                  </div>
                  {log.response && (
                    <div className="mt-2">
                      <strong>Response:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">
                        {JSON.stringify(log.response, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}