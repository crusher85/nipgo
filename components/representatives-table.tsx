import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface Representative {
  name: string
  role: string
  function: string
  since: string
  pesel?: string
}

interface RepresentativesTableProps {
  representatives: Representative[]
}

export function RepresentativesTable({ representatives }: RepresentativesTableProps) {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Imię i nazwisko</TableHead>
            <TableHead>Funkcja</TableHead>
            <TableHead>Organ</TableHead>
            <TableHead>Od</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {representatives.map((rep, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{rep.name}</TableCell>
              <TableCell>
                <Badge variant="secondary" className="font-normal">
                  {rep.function}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">{rep.role}</TableCell>
              <TableCell className="text-muted-foreground">{rep.since}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
