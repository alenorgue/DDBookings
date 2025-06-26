class Booking {
  constructor({
    id,
    guestId,
    hostId,
    accommodationId,
    startDate,
    endDate,
    guests,
    status,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.guestId = guestId;
    this.hostId = hostId;
    this.accommodationId = accommodationId;
    this.startDate = startDate;
    this.endDate = endDate;
    this.guests = guests;
    this.status = status || 'pending';
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
export default Booking;
