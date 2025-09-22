import { useState } from "react"
import { Wifi, RefreshCw, AlertTriangle, X } from "lucide-react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Alert, AlertDescription } from "./alert"

interface NetworkErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  onDismiss?: () => void
  showDismiss?: boolean
  variant?: "inline" | "overlay" | "toast"
}

export function NetworkError({
  title = "Connection Error",
  message = "Unable to connect to the server. Please check your internet connection and try again.",
  onRetry,
  onDismiss,
  showDismiss = true,
  variant = "inline"
}: NetworkErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    if (!onRetry) return

    setIsRetrying(true)
    try {
      await onRetry()
    } finally {
      setIsRetrying(false)
    }
  }

  const content = (
    <Alert className="border-red-200 bg-red-50/50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="flex-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-red-900">{title}</h4>
            {showDismiss && onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-red-800">{message}</p>
          {onRetry && (
            <div className="pt-2">
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                size="sm"
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Try Again
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )

  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <Wifi className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{message}</p>
            <div className="flex gap-3 justify-center">
              {onRetry && (
                <Button onClick={handleRetry} disabled={isRetrying}>
                  {isRetrying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Try Again
                    </>
                  )}
                </Button>
              )}
              {showDismiss && onDismiss && (
                <Button variant="outline" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (variant === "toast") {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        {content}
      </div>
    )
  }

  return content
}
