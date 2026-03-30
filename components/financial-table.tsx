import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface FinancialData {
  year: string
  revenue: number
  profit: number
  assets: number
  employees: number
}

interface FinancialTableProps {
  data: FinancialData[]
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function TrendIndicator({ current, previous }: { current: number; previous?: number }) {
  if (!previous) return null
  const change = ((current - previous) / previous) * 100
  
  if (Math.abs(change) < 1) {
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
  }
  
  if (change > 0) {
    return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
  }
  
  return <TrendingDown className="h-3.5 w-3.5 text-red-500" />
}

export function FinancialTable({ data }: FinancialTableProps) {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-24">Rok</TableHead>
            <TableHead className="text-right">Przychody</TableHead>
            <TableHead className="text-right">Zysk netto</TableHead>
            <TableHead className="text-right">Aktywa</TableHead>
            <TableHead className="text-right">Zatrudnienie</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row.year}>
              <TableCell className="font-medium">{row.year}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {formatCurrency(row.revenue)}
                  <TrendIndicator current={row.revenue} previous={data[index + 1]?.revenue} />
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <span className={row.profit < 0 ? "text-red-500" : ""}>
                    {formatCurrency(row.profit)}
                  </span>
                  <TrendIndicator current={row.profit} previous={data[index + 1]?.profit} />
                </div>
              </TableCell>
              <TableCell className="text-right">{formatCurrency(row.assets)}</TableCell>
              <TableCell className="text-right">{row.employees}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
