import { AlertCircle, CheckCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormErrorProps {
  error?: string
  success?: string
  info?: string
  className?: string
}

export function FormError({ error, success, info, className }: FormErrorProps) {
  if (!error && !success && !info) return null

  const getIcon = () => {
    if (error) return <AlertCircle className="h-4 w-4 text-red-600" />
    if (success) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (info) return <Info className="h-4 w-4 text-blue-600" />
  }

  const getStyles = () => {
    if (error) return "border-red-200 bg-red-50/50 text-red-800"
    if (success) return "border-green-200 bg-green-50/50 text-green-800"
    if (info) return "border-blue-200 bg-blue-50/50 text-blue-800"
  }

  const message = error || success || info

  return (
    <div className={cn(
      "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
      getStyles(),
      className
    )}>
      {getIcon()}
      <span className="flex-1">{message}</span>
    </div>
  )
}

interface FieldErrorProps {
  error?: string
  className?: string
}

export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null

  return (
    <p className={cn(
      "flex items-center gap-1 text-sm text-red-600 mt-1",
      className
    )}>
      <AlertCircle className="h-3 w-3 flex-shrink-0" />
      {error}
    </p>
  )
}

interface FormSummaryProps {
  errors: Record<string, string>
  title?: string
  className?: string
}

export function FormSummary({ errors, title = "Please fix the following errors:", className }: FormSummaryProps) {
  const errorEntries = Object.entries(errors).filter(([, error]) => error)

  if (errorEntries.length === 0) return null

  return (
    <div className={cn(
      "rounded-md border border-red-200 bg-red-50/50 p-4",
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <h4 className="text-sm font-medium text-red-900">{title}</h4>
      </div>
      <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
        {errorEntries.map(([field, error]) => (
          <li key={field}>{error}</li>
        ))}
      </ul>
    </div>
  )
}
