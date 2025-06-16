import { canonicalChecklist } from "@/components/founders-edge-checklist";

interface ResearchDataTableProps {
  data: Record<string, any>;
}

export function ResearchDataTable({ data }: ResearchDataTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="px-3 py-2 text-left font-normal">Metric</th>
            <th className="px-3 py-2 text-left font-normal">Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {canonicalChecklist.map(({ label, display }) => (
            <tr key={label}>
              <td className="px-3 py-2 font-medium text-white">{display}</td>
              <td className="px-3 py-2 text-slate-300">{data[label] ?? "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
