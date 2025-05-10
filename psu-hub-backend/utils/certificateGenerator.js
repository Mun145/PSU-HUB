const { join } = require('path');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { loadImage, createCanvas } = require('canvas');

const CERT_DIR = join(__dirname, '..', 'uploads', 'certificates');
if (!existsSync(CERT_DIR)) mkdirSync(CERT_DIR, { recursive: true });

module.exports = async function generateCert({ userName, eventTitle, certId }) {
  const tpl = await loadImage(join(__dirname, '..', 'assets', 'cert_template.png'));
  const canvas = createCanvas(tpl.width, tpl.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(tpl, 0, 0);

  const centerX = tpl.width / 2;

  // Header: Certificate of Appreciation
  ctx.font = 'bold 48px "Times New Roman"';
  ctx.fillStyle = '#f58220'; // orange
  ctx.textAlign = 'center';
  ctx.fillText('Certificate of Appreciation', centerX, 330);

  // Body message
  ctx.font = '28px "Times New Roman"';
  ctx.fillStyle = '#002855'; // PSU blue
  ctx.fillText('The Community Service and Continuing Education Center would like to thank', centerX, 390);

  // User name in blue
  ctx.font = 'bold 40px "Times New Roman"';
  ctx.fillStyle = '#3366cc'; // bright blue
  ctx.fillText(userName, centerX, 440);

  // Event title line
  ctx.font = '28px "Times New Roman"';
  ctx.fillStyle = '#002855';
  ctx.fillText(`for participation in our Community Service: "${eventTitle}"`, centerX, 490);

  // Date line (e.g., 08-February-2025)
  const now = new Date();
  const options = { year: 'numeric', month: 'long', day: '2-digit' };
  const formattedDate = now.toLocaleDateString('en-US', options).replace(',', '');
  ctx.font = 'bold 24px "Times New Roman"';
  ctx.fillStyle = '#f58220'; // orange
  ctx.fillText(formattedDate, centerX, 550);

  // Save
  const fileName = `certificate_${certId}.png`;
  const filePath = join(CERT_DIR, fileName);
  writeFileSync(filePath, canvas.toBuffer('image/png'));

  return `/certificates/${fileName}`;
};
