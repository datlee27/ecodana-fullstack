// ─── Pagination — reusable pagination bar for admin tables ────────────────────
import type { PaginationState } from '../../hooks/usePagination';

interface PaginationProps {
  pagination: PaginationState;
  visiblePages: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const Pagination = ({
  pagination,
  visiblePages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  className = '',
}: PaginationProps) => {
  const { currentPage, totalPages, totalItems, startIndex, endIndex, hasPrevious, hasNext, pageSize } = pagination;

  if (totalItems === 0) return null;

  return (
    <nav
      className={`mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}
      data-shell-zone="page-pagination"
      aria-label="Phân trang"
    >
      {/* Info + Page size selector */}
      <div className="flex items-center gap-4 text-sm text-text-muted">
        <span>
          Hiển thị <span className="font-medium text-text-strong">{startIndex + 1}</span>–
          <span className="font-medium text-text-strong">{endIndex}</span> trong{' '}
          <span className="font-medium text-text-strong">{totalItems}</span> kết quả
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 px-2 border border-border-color rounded-md text-xs text-text-base bg-surface focus:outline-none focus:ring-1 focus:ring-eco-green appearance-none cursor-pointer"
            aria-label="Số dòng mỗi trang"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / trang
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Page buttons */}
      <div className="flex items-center gap-1.5">
        {/* First page */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={!hasPrevious}
          className="flex items-center justify-center w-8 h-8 border border-border-color rounded-md text-text-muted hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Trang đầu"
        >
          <span className="material-symbols-outlined text-[18px]">first_page</span>
        </button>

        {/* Previous */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className="flex items-center justify-center w-8 h-8 border border-border-color rounded-md text-text-muted hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Trang trước"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </button>

        {/* Leading ellipsis */}
        {visiblePages[0] > 1 && (
          <span className="w-8 h-8 flex items-center justify-center text-xs text-text-muted">…</span>
        )}

        {/* Page numbers */}
        {visiblePages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
              page === currentPage
                ? 'bg-eco-green text-white shadow-sm'
                : 'border border-border-color text-text-muted hover:bg-canvas hover:text-text-strong'
            }`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}

        {/* Trailing ellipsis */}
        {visiblePages[visiblePages.length - 1] < totalPages && (
          <span className="w-8 h-8 flex items-center justify-center text-xs text-text-muted">…</span>
        )}

        {/* Next */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="flex items-center justify-center w-8 h-8 border border-border-color rounded-md text-text-muted hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Trang sau"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </button>

        {/* Last page */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext}
          className="flex items-center justify-center w-8 h-8 border border-border-color rounded-md text-text-muted hover:bg-canvas disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Trang cuối"
        >
          <span className="material-symbols-outlined text-[18px]">last_page</span>
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
