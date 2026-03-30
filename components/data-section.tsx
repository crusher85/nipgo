import { ReactNode } from "react"
import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface DataSectionProps {
  title: string
  icon: ReactNode
  children: ReactNode
  defaultOpen?: boolean
}

export function DataSection({ title, icon, children, defaultOpen = true }: DataSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="bg-card rounded-lg border border-border">
      <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-t-lg data-[state=closed]:rounded-b-lg">
        <div className="flex items-center gap-2.5">
          <span className="text-primary">{icon}</span>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t border-border px-4 pb-4 pt-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

interface DataRowProps {
  label: string
  value: string | ReactNode
  valueClassName?: string
}

export function DataRow({ label, value, valueClassName = "" }: DataRowProps) {
  return (
    <div className="flex items-start py-2 border-b border-border/50 last:border-0">
      <dt className="w-40 shrink-0 text-sm text-muted-foreground">{label}</dt>
      <dd className={`flex-1 text-sm text-foreground ${valueClassName}`}>{value}</dd>
    </div>
  )
}

interface DataGridProps {
  children: ReactNode
}

export function DataGrid({ children }: DataGridProps) {
  return <dl className="divide-y divide-border/50">{children}</dl>
}
