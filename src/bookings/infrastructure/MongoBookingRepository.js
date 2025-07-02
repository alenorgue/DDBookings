import BookingModel from '../models/BookingModel.js';
import Booking from '../domain/Booking.js';

class MongoBookingRepository {
    async save(booking) {
        const data = {
            guestId: booking.guestId,
            hostId: booking.hostId,
            accommodationId: booking.accommodationId,
            startDate: booking.startDate,
            endDate: booking.endDate,
            guests: booking.guests,
            status: booking.status
        };

        const created = await BookingModel.create(data);
        return new Booking({ ...created.toObject(), id: created._id });
    }

    async findById(id) {
        const found = await BookingModel.findById(id);
        if (!found) return null;
        return new Booking({ ...found.toObject(), id: found._id });
    }

    async findByGuestId(guestId) {
        const found = await BookingModel.find({ guestId });
        return found.map(doc => new Booking({ ...doc.toObject(), id: doc._id }));
    }

    async findByHostId(hostId) {
        const found = await BookingModel.find({ hostId });
        return found.map(doc => new Booking({ ...doc.toObject(), id: doc._id }));
    }
    async findByAccommodationId(accommodationId) {
        const found = await BookingModel.find({ accommodationId });
        return found.map(doc => new Booking({ ...doc.toObject(), id: doc._id }));
    }
    async findConfirmedByAccommodationId(accommodationId) {
        const found = await BookingModel.find({ accommodationId, status: 'confirmed' });
        return found.map(doc => new Booking({ ...doc.toObject(), id: doc._id }));
    }
    async findOverlappingBookings(accommodationId, startDate, endDate) {
        return await BookingModel.find({
            accommodationId,
            status: { $in: ['confirmed'] }, // Opcional: solo reservas activas
            $or: [
                {
                    startDate: { $lte: endDate },
                    endDate: { $gte: startDate }
                }
            ]
        });
    }
    async updateStatus(id, status) {
        const updated = await BookingModel.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) return null;
        return new Booking({ ...updated.toObject(), id: updated._id });
    }

    async findAll() {
        const found = await BookingModel.find();
        return found.map(doc => new Booking({ ...doc.toObject(), id: doc._id }));
    }
}

export default MongoBookingRepository;