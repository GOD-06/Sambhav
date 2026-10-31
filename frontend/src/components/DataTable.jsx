export default function DataTable({ columns, data, emptyMessage = 'No records found.' }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[11px]">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">
          {data.map((row, rowIdx) => (
            <tr key={rowIdx} className="hover:bg-slate-50/70 transition">
              {columns.map((col, colIdx) => (
                <td key={colIdx} className="py-2.5 px-3">
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
