export function bookingAvailability(event, ticketId, quantity, now = Date.now()) {
  const ticket = event?.ticketTypes?.find(item => item.id === ticketId);
  let reason = '';
  if (!event || event.isSalesActive === false) reason = 'Tạm ngưng bán vé';
  else if (event.registrationDeadline && now >= Date.parse(event.registrationDeadline)) reason = 'Đã hết hạn đăng ký';
  else if (event.startDate && now >= Date.parse(event.startDate)) reason = 'Sự kiện đã bắt đầu';
  else if (!ticket) reason = 'Vui lòng chọn loại vé';
  else if (ticket.isActive === false || (ticket.saleStartDate && now < Date.parse(ticket.saleStartDate)) ||
    (ticket.saleEndDate && now >= Date.parse(ticket.saleEndDate))) reason = 'Loại vé chưa mở bán hoặc đã ngừng bán';
  const limit = ticket ? Math.max(0, Math.min(ticket.totalQuantity - (ticket.soldQuantity || 0), ticket.maxPerOrder ?? 10)) : 0;
  if (!reason && limit === 0) reason = 'Loại vé đã hết';
  if (!reason && (!Number.isInteger(quantity) || quantity < 1 || quantity > limit)) reason = `Vui lòng chọn từ 1 đến ${limit} vé`;
  return { reason, limit, canRegister: !reason };
}

export function bookingReturnPath(from) {
  return typeof from === 'string' && /^\/(?:attendee\/)?events\/[^/?#]+(?:[?#].*)?$/.test(from)
    ? from : null;
}
