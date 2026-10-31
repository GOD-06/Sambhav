import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems = 0 }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.08]">
      <div className="hidden sm:block">
        <p className="text-xs text-white/50 font-mono">
          Page <span className="text-white font-medium">{currentPage}</span> of{' '}
          <span className="text-white font-medium">{totalPages}</span>
          {totalItems > 0 && (
            <> | <span className="text-white font-medium">{totalItems}</span> total items</>
          )}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 text-white/50 hover:text-white hover:bg-white/[0.08] rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {start > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="px-2.5 py-1 text-xs rounded-md hover:bg-white/[0.08] text-white/70 font-mono transition"
            >
              1
            </button>
            {start > 2 && <span className="px-1 text-white/30 text-xs">...</span>}
          </>
        )}
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-2.5 py-1 text-xs rounded-md font-mono transition ${
              page === currentPage
                ? 'bg-[#E8FF1F] text-black font-semibold'
                : 'hover:bg-white/[0.08] text-white/70'
            }`}
          >
            {page}
          </button>
        ))}
        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1 text-white/30 text-xs">...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              className="px-2.5 py-1 text-xs rounded-md hover:bg-white/[0.08] text-white/70 font-mono transition"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-1.5 text-white/50 hover:text-white hover:bg-white/[0.08] rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
