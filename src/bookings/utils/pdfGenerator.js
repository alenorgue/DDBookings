// utils/pdfGenerator.js
import PDFDocument from 'pdfkit';

export function generateBookingPDF(booking, accommodation, user, res) {
  const doc = new PDFDocument();

  // Set headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=confirmacion_reserva.pdf');

  // Pipe output to response
  doc.pipe(res);

  doc.fontSize(20).text('Confirmación de Reserva', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`Reserva ID: ${booking.id || booking._id}`);
  doc.text(`Usuario: ${user.name || user.email || ''} ${(user.surName || user.surname || '')}`);
  doc.text(`Alojamiento: ${accommodation.title}`);
  doc.text(`Entrada: ${booking.startDate ? new Date(booking.startDate).toLocaleDateString() : ''}`);
  doc.text(`Salida: ${booking.endDate ? new Date(booking.endDate).toLocaleDateString() : ''}`);
  if (booking.pricePerNight && booking.startDate && booking.endDate) {
    const nights = (new Date(booking.endDate) - new Date(booking.startDate)) / (1000*60*60*24);
    doc.text(`Precio total: €${(booking.pricePerNight * nights).toFixed(2)}`);
  }
  doc.moveDown();

  doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`);

  doc.end();
}
