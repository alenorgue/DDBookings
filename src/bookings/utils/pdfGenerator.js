// utils/pdfGenerator.js
import PDFDocument from 'pdfkit';
import https from 'https';

export function generateBookingPDF(booking, accommodation, user, res) {
  // Margen izquierdo más ancho, margen derecho estándar
  const doc = new PDFDocument({ margin: [40, 40, 40, 80] }); // [top, right, bottom, left]

  // Set headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=confirmacion_reserva.pdf');

  // Pipe output to response
  doc.pipe(res);

  // Banner decorativo
  doc.rect(0, 0, doc.page.width, 60).fill('#2a4365');
  doc.fillColor('white').fontSize(26).text('Confirmación de Reserva', 0, 18, { align: 'center', width: doc.page.width });
  doc.moveDown(2);
  doc.fillColor('black');

  // Main photo (si existe)
  let photoRendered = false;
  if (accommodation.mainPhoto && /^https?:\/\//.test(accommodation.mainPhoto)) {
    try {
      const url = accommodation.mainPhoto;
      https.get(url, (imgRes) => {
        const data = [];
        imgRes.on('data', chunk => data.push(chunk));
        imgRes.on('end', () => {
          const buffer = Buffer.concat(data);
          doc.image(buffer, doc.page.margins.left + 20, 70, { width: 180, height: 110 });
          photoRendered = true;
          renderDetails();
        });
      }).on('error', () => renderDetails());
      return;
    } catch (e) {
      // Si falla, sigue sin imagen
    }
  }
  renderDetails();

  function renderDetails() {
    // Ajusta el espacio si hay foto
    if (photoRendered) {
      doc.moveDown(7);
    } else {
      doc.moveDown(4);
    }
    doc.fontSize(14).fillColor('#2a4365').text('Datos de la Reserva', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('black');
    doc.text(`Reserva ID: ${booking.id || booking._id}`);
    doc.text(`Usuario: ${user.name || user.email || ''} ${(user.surName || user.surname || '')}`);
    doc.text(`Alojamiento: ${accommodation.title}`);
    doc.text(`Dirección: ${accommodation.location && accommodation.location.address ? accommodation.location.address : ''}`);
    doc.text(`Entrada: ${booking.startDate ? new Date(booking.startDate).toLocaleDateString() : ''}`);
    doc.text(`Salida: ${booking.endDate ? new Date(booking.endDate).toLocaleDateString() : ''}`);
    if (booking.pricePerNight && booking.startDate && booking.endDate) {
      const nights = (new Date(booking.endDate) - new Date(booking.startDate)) / (1000*60*60*24);
      doc.text(`Precio por noche: €${booking.pricePerNight.toFixed(2)}`);
      doc.text(`Noches: ${nights}`);
      doc.text(`Precio total: €${(booking.pricePerNight * nights).toFixed(2)}`);
    }
    doc.moveDown();
    doc.fontSize(12).fillColor('#2a4365').text(`Fecha de emisión: ${new Date().toLocaleDateString()}`);
    // Footer decorativo fijo en la base
    doc.on('pageAdded', () => {}); // Evita salto de página accidental
    const footerHeight = 40;
    const footerY = doc.page.height - footerHeight;
    doc.save();
    doc.rect(0, footerY, doc.page.width, footerHeight).fill('#2a4365');
    doc.fillColor('white').fontSize(10).text('Gracias por confiar en nuestra plataforma', 0, footerY + 12, { align: 'center', width: doc.page.width });
    doc.restore();
    // Forzar el end solo si estamos en la primera página
    if (doc.page.number === 1) doc.end();
  }
}
