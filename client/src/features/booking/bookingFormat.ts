export const formatCurrency = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(value || 0))} ₫`;

export const formatDateTime = (isoDateTime: string) => {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) {
    return isoDateTime || '--';
  }

  return date.toLocaleString('vi-VN', {
    hour12: false,
  });
};

export const formatDateTimeFromInputs = (date: string, time: string) => {
  if (!date || !time) return '--';
  const parsed = new Date(`${date}T${time}:00`);
  if (Number.isNaN(parsed.getTime())) {
    return `${date} ${time}`;
  }

  return parsed.toLocaleString('vi-VN', {
    hour12: false,
  });
};

export const bookingStatusText: Record<string, string> = {
  Pending: 'Chờ duyệt',
  Approved: 'Đã duyệt',
  AwaitingDeposit: 'Chờ thanh toán',
  Confirmed: 'Đã thanh toán',
  Ongoing: 'Đang thuê',
  Completed: 'Hoàn thành',
  RefundPending: 'Đang hủy',
  Refunded: 'Đã hoàn tiền',
  Cancelled: 'Đã hủy',
  Rejected: 'Từ chối',
};

export const getBookingStatusTone = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
  if (['Confirmed', 'Ongoing', 'Completed', 'Refunded'].includes(status)) return 'success';
  if (['Pending', 'RefundPending'].includes(status)) return 'warning';
  if (['Cancelled', 'Rejected'].includes(status)) return 'danger';
  if (['Approved', 'AwaitingDeposit'].includes(status)) return 'info';
  return 'neutral';
};
