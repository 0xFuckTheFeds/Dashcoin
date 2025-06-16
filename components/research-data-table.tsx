import { canonicalChecklist } from "./founders-edge-checklist";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";

export function ResearchDataTable({ data }: { data: Record<string, any> }) {
  if (!data) return null;
  return (
    <Table className="text-sm">
      <TableHeader>
        <TableRow>
          <TableHead className="text-slate-300">Metric</TableHead>
          <TableHead className="text-slate-300">Value</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {canonicalChecklist.map(({ label, display }) => (
          <TableRow key={label} className="border-b border-white/10 last:border-b-0">
            <TableCell className="font-medium text-white">{display}</TableCell>
            <TableCell className="text-slate-300">{data[label] ?? "-"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
