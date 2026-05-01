/**
 * usePagination — client-side pagination hook.
 *
 * Since the backend returns full arrays without server-side pagination,
 * this hook slices data on the frontend and provides page navigation state.
 */
import { useMemo, useState, useCallback, useEffect } from 'react';

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  startIndex: number;
  endIndex: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface UsePaginationReturn<T> {
  /** Sliced data for the current page */
  pageData: T[];
  /** Full pagination metadata */
  pagination: PaginationState;
  /** Navigate to a specific page (1-indexed) */
  goToPage: (page: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Change items per page */
  setPageSize: (size: number) => void;
  /** Get visible page numbers for the pagination bar */
  visiblePages: number[];
  /** Number of empty row slots on the current page (pageSize - pageData.length) */
  emptyRowCount: number;
  /** Min-height (px) for the table scroll container to prevent layout shift */
  tableMinHeight: number;
}

const DEFAULT_PAGE_SIZE = 10;
const MAX_VISIBLE_PAGES = 5;

/** Approximate row height (py-4 padding + content + border) in admin tables */
const TABLE_ROW_HEIGHT = 57;
/** Approximate thead height (py-3 padding + content) */
const TABLE_HEADER_HEIGHT = 45;

export function usePagination<T>(
  data: T[],
  initialPageSize = DEFAULT_PAGE_SIZE,
): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset to page 1 when data or pageSize changes
  useEffect(() => {
    setCurrentPage(1);
  }, [totalItems, pageSize]);

  // Clamp currentPage within valid range
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const pageData = useMemo(
    () => data.slice(startIndex, endIndex),
    [data, startIndex, endIndex],
  );

  const pagination: PaginationState = useMemo(() => ({
    currentPage: safePage,
    totalPages,
    totalItems,
    pageSize,
    startIndex,
    endIndex,
    hasPrevious: safePage > 1,
    hasNext: safePage < totalPages,
  }), [safePage, totalPages, totalItems, pageSize, startIndex, endIndex]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((p) => Math.max(p - 1, 1));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(Math.max(1, size));
  }, []);

  // Compute visible page buttons (sliding window)
  const visiblePages = useMemo(() => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = Math.floor(MAX_VISIBLE_PAGES / 2);
    let start = safePage - half;
    let end = safePage + half;

    if (start < 1) {
      start = 1;
      end = MAX_VISIBLE_PAGES;
    }
    if (end > totalPages) {
      end = totalPages;
      start = totalPages - MAX_VISIBLE_PAGES + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [safePage, totalPages]);

  const emptyRowCount = totalItems > 0 ? pageSize - pageData.length : 0;
  const tableMinHeight = pageSize * TABLE_ROW_HEIGHT + TABLE_HEADER_HEIGHT;

  return {
    pageData,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    visiblePages,
    emptyRowCount,
    tableMinHeight,
  };
}
