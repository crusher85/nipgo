import { Badge } from "@/components/ui/badge"

interface PKDCode {
  code: string
  description: string
  isPrimary?: boolean
}

interface PKDCodesListProps {
  codes: PKDCode[]
}

export function PKDCodesList({ codes }: PKDCodesListProps) {
  const primaryCode = codes.find(c => c.isPrimary)
  const otherCodes = codes.filter(c => !c.isPrimary)

  return (
    <div className="space-y-3">
      {primaryCode && (
        <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <Badge className="shrink-0 bg-primary text-primary-foreground">
            {primaryCode.code}
          </Badge>
          <div>
            <p className="text-sm font-medium text-foreground">{primaryCode.description}</p>
            <p className="text-xs text-primary mt-0.5">Działalność przeważająca</p>
          </div>
        </div>
      )}
      
      {otherCodes.length > 0 && (
        <div className="space-y-2">
          {otherCodes.map((code) => (
            <div key={code.code} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
              <Badge variant="secondary" className="shrink-0">
                {code.code}
              </Badge>
              <p className="text-sm text-muted-foreground">{code.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
