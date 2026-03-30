import { Progress } from "@/components/ui/progress"

interface Shareholder {
  name: string
  shares: number
  percentage: number
  type: "person" | "company"
}

interface ShareholdersListProps {
  shareholders: Shareholder[]
  totalCapital: number
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function ShareholdersList({ shareholders, totalCapital }: ShareholdersListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Kapitał zakładowy</span>
        <span className="font-semibold text-foreground">{formatCurrency(totalCapital)}</span>
      </div>
      <div className="space-y-3">
        {shareholders.map((shareholder, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{shareholder.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({shareholder.type === "person" ? "osoba fizyczna" : "osoba prawna"})
                </span>
              </div>
              <span className="text-muted-foreground">{shareholder.percentage.toFixed(1)}%</span>
            </div>
            <Progress value={shareholder.percentage} className="h-1.5" />
            <div className="text-xs text-muted-foreground">
              {shareholder.shares.toLocaleString("pl-PL")} udziałów
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
