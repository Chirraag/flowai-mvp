import { Fragment } from "react"
import { useLocation, Link } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface BreadcrumbNavProps {
  items?: BreadcrumbItem[]
  className?: string
}

// Generate breadcrumbs based on current route
function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/', icon: Home }
  ]

  let currentPath = ''

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // Human-readable labels for common routes
    const labelMap: Record<string, string> = {
      'launchpad': 'Account Setup',
      'analytics': 'Analytics Dashboard',
      'ai-agents': 'AI Agents',
      'scheduling': 'Scheduling Agent',
      'patient-intake': 'Patient Intake Agent',
      'customer-support': 'Customer Support Agent'
    }

    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

    breadcrumbs.push({
      label,
      href: currentPath
    })
  })

  return breadcrumbs
}

export function BreadcrumbNav({ items, className }: BreadcrumbNavProps) {
  const location = useLocation()
  const breadcrumbs = items || generateBreadcrumbs(location.pathname)

  if (breadcrumbs.length <= 1) return null

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        const IconComponent = item.icon

        return (
          <Fragment key={item.href || item.label}>
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            )}

            {isLast ? (
              <span className="flex items-center gap-2 font-medium text-foreground">
                {IconComponent && <IconComponent className="h-4 w-4" />}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href!}
                className="flex items-center gap-2 hover:text-foreground transition-colors duration-200 hover:underline"
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
                {item.label}
              </Link>
            )}
          </Fragment>
        )
      })}
    </nav>
  )
}

// Contextual help tooltip component
interface ContextualHelpProps {
  content: string
  position?: "top" | "bottom" | "left" | "right"
  className?: string
}

export function ContextualHelp({ content, position = "top", className }: ContextualHelpProps) {
  return (
    <div className={cn("relative group", className)}>
      <button
        type="button"
        className="flex items-center justify-center w-5 h-5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors duration-200"
        aria-label="Help"
      >
        <span className="text-xs font-medium">?</span>
      </button>

      <div className={cn(
        "absolute z-50 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200",
        "px-3 py-2 text-sm text-popover-foreground bg-popover border border-border rounded-md shadow-md max-w-xs",
        {
          "bottom-full left-1/2 transform -translate-x-1/2 mb-2": position === "top",
          "top-full left-1/2 transform -translate-x-1/2 mt-2": position === "bottom",
          "right-full top-1/2 transform -translate-y-1/2 mr-2": position === "left",
          "left-full top-1/2 transform -translate-y-1/2 ml-2": position === "right"
        }
      )}>
        {content}
        <div className={cn(
          "absolute w-2 h-2 bg-popover border-border rotate-45",
          {
            "top-full left-1/2 transform -translate-x-1/2 -mt-1 border-t border-l": position === "top",
            "bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-b border-r": position === "bottom",
            "left-full top-1/2 transform -translate-y-1/2 -ml-1 border-l border-b": position === "left",
            "right-full top-1/2 transform -translate-y-1/2 -mr-1 border-r border-t": position === "right"
          }
        )} />
      </div>
    </div>
  )
}
