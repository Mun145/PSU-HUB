// services/certificateService.js
const path   = require('path');
const fs     = require('fs/promises');
const PDFLib = require('pdf-lib');          //  npm i pdf-lib
const { User } = require('../models');

const bgPath = path.join(__dirname, '..', 'assets', 'cert_template.png');  // <-- put your image here
const outDir = path.join(__dirname, '../uploads/certificates');

exports.generateCertificate = async (userId, event) => {
  await fs.mkdir(outDir, { recursive: true });

  const user   = await User.findByPk(userId);
  const bgData = await fs.readFile(bgPath);
  const pdfDoc = await PDFLib.PDFDocument.create();
  const page   = pdfDoc.addPage();

  const { width, height } = page.getSize();
  const bgImage = await pdfDoc.embedJpg(bgData);
  page.drawImage(bgImage, { x:0, y:0, width, height });

  const font = await pdfDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);

  page.drawText(user.name, {
    x: width/2 - font.widthOfTextAtSize(user.name, 24)/2,
    y: height/2 + 20,
    size: 24,
    font
  });

  page.drawText(event.title, {
    x: width/2 - font.widthOfTextAtSize(event.title, 16)/2,
    y: height/2 - 10,
    size: 16,
    font
  });

  page.drawText(new Date().toLocaleDateString(), {
    x: width/2 - 50,
    y: 60,
    size: 12,
    font
  });

  const pdfBytes = await pdfDoc.save();
  const fileName = `${event.id}-${userId}.pdf`;
  const filePath = path.join(outDir, fileName);
  await fs.writeFile(filePath, pdfBytes);

  return `/uploads/certificates/${fileName}`;   // public URL
};

exports.issueCertificateIfNeeded = async function (event, userId) {
  if (!event.hasCertificate) return null;

  const { Certificate } = require('../models');
  const [cert] = await Certificate.findOrCreate({
    where: { userId, eventId: event.id },
    defaults: { issuedAt: new Date() }
  });

  if (!cert.fileUrl) {
    cert.fileUrl = await exports.generateCertificate(userId, event);
    cert.issuedAt = new Date();
    await cert.save();
  }
  return cert;
};
