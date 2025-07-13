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

  // Banner decorativo y logo superior
  // Banner decorativo beige y logo a la izquierda
  const bannerColor = '#f5e9da'; // beige/marrón claro
  doc.rect(0, 0, doc.page.width, 60).fill(bannerColor);
  try {
    doc.image('public/img/logo-pdf.jpg', doc.page.width - doc.page.margins.right - 80, 10, { width: 70, height: 40 });
  } catch (e) {
    // Si falla, sigue sin logo
  }
  doc.fillColor('#7c5c3b').fontSize(26).text('Confirmación de Reserva', 90, 18, { align: 'left', width: doc.page.width - 180 });
  doc.moveDown(1.5);
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
    const left = doc.page.margins.left + 20;
    const width = doc.page.width - left - doc.page.margins.right - 10;
    // Main photo local (más grande, centrada)
    if (accommodation.mainPhoto && !/^https?:\/\//.test(accommodation.mainPhoto)) {
      try {
        doc.image(accommodation.mainPhoto, doc.page.width / 2 - 110, 70, { width: 220, height: 140 });
        doc.moveDown(6);
      } catch (e) {
        doc.moveDown(4);
      }
    } else {
      doc.moveDown(4);
    }
    doc.fontSize(14).fillColor('#7c5c3b').text('Datos de la Reserva', left, undefined, { underline: true, width });
    doc.moveDown(0.5);
    doc.fontSize(12).fillColor('black');
    doc.text(`Reserva ID: ${booking.id || booking._id}`, left, undefined, { width });
    doc.text(`Viajero: ${user.name || user.email || ''} ${(user.surName || user.surname || '')}`, left, undefined, { width });
    doc.text(`Alojamiento: ${accommodation.title}`, left, undefined, { width });
    doc.text(`Dirección: ${accommodation.location && accommodation.location.address ? accommodation.location.address : ''}`, left, undefined, { width });
    doc.text(`Entrada: ${booking.startDate ? new Date(booking.startDate).toLocaleDateString() : ''}`, left, undefined, { width });
    doc.text(`Salida: ${booking.endDate ? new Date(booking.endDate).toLocaleDateString() : ''}`, left, undefined, { width });
    if (booking.pricePerNight && booking.startDate && booking.endDate) {
      const nights = (new Date(booking.endDate) - new Date(booking.startDate)) / (1000*60*60*24);
      doc.text(`Precio por noche: €${booking.pricePerNight.toFixed(2)}`, left, undefined, { width });
      doc.text(`Noches: ${nights}`, left, undefined, { width });
      doc.text(`Precio total: €${(booking.pricePerNight * nights).toFixed(2)}`, left, undefined, { width });
    }
    doc.moveDown();
    doc.fontSize(12).fillColor('#7c5c3b').text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, left, undefined, { width });
    // Mensaje de agradecimiento justo encima del banner inferior
    const footerHeight = 40;
    const footerY = doc.page.height - footerHeight;
    // Calcula la posición Y para el texto de agradecimiento (unos 30px por encima del banner)
    const thanksY = footerY - 30;
    doc.fontSize(11).fillColor('#7c5c3b').text('Gracias por confiar en nuestra plataforma', 0, thanksY, { align: 'center', width: doc.page.width });
    // Footer decorativo fijo en la base
    doc.save();
    doc.rect(0, footerY, doc.page.width, footerHeight).fill(bannerColor);
    doc.restore();
    doc.end();
  }
}
