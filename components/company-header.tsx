import { Badge } from "@/components/ui/badge"
import { Building2, CheckCircle2 } from "lucide-react"

interface CompanyHeaderProps {
  name: string
  nip: string
  regon: string
  krs: string
  status: "active" | "inactive" | "liquidation"
  legalForm: string
}

export function CompanyHeader({ name, nip, regon, krs, status, legalForm }: CompanyHeaderProps) {
  const statusConfig = {
    active: { label: "Aktywna", variant: "default" as const, className: "bg-emerald-500 text-white hover:bg-emerald-600" },
    inactive: { label: "Nieaktywna", variant: "secondary" as const, className: "bg-muted text-muted-foreground" },
    liquidation: { label: "W likwidacji", variant: "destructive" as const, className: "" },
  }

  const currentStatus = statusConfig[status]

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-7 w-7 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground leading-tight text-balance">{name}</h1>
            <Badge className={currentStatus.className} variant={currentStatus.variant}>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              {currentStatus.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{legalForm}</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">NIP:</span>
              <span className="font-medium text-foreground">{nip}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">REGON:</span>
              <span className="font-medium text-foreground">{regon}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">KRS:</span>
              <span className="font-medium text-foreground">{krs}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
