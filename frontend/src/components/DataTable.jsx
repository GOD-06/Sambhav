export default function DataTable({ columns, data, emptyMessage = 'No records found.' }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-white/40">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-white/[0.02]">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-white/[0.04] text-white/50 border-b border-white/[0.08]">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04] text-white/80">
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-white/[0.03] transition">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="py-3 px-4">
                  {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor] ?? 'N/A'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
