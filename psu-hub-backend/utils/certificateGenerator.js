/* utils/certificateGenerator.js */
const { join }                 = require('path');
const { writeFileSync, mkdirSync, existsSync } = require('fs');
const { loadImage, createCanvas } = require('canvas');      //  npm i canvas

const CERT_DIR = join(__dirname, '..', 'uploads', 'certificates');
if (!existsSync(CERT_DIR)) mkdirSync(CERT_DIR, { recursive: true });   // << UPDATE

/**
 * Render a PNG certificate and return the public URL
 * @param {Object}  opts
 * @param {string}  opts.userName
 * @param {string}  opts.eventTitle
 * @param {number}  opts.certId
 * @returns {Promise<string>}  /uploads/certificates/...
 */
module.exports = async function generateCert ({ userName, eventTitle, certId }) {
  /* ---- load background template ---- */
  const tpl = await loadImage(
    join(__dirname, '..', 'assets', 'cert_template.png')
  );

  /* ---- canvas ---- */
  const canvas = createCanvas(tpl.width, tpl.height);
  const ctx    = canvas.getContext('2d');
  ctx.drawImage(tpl, 0, 0);

  /* ---- text ---- */
  ctx.font = 'bold 42px "Times New Roman"';
  ctx.fillStyle = '#002855';
  ctx.textAlign = 'center';
  ctx.fillText(userName, tpl.width / 2, 520);

  ctx.font = '28px "Times New Roman"';
  ctx.fillText(eventTitle, tpl.width / 2, 600);

  /* ---- save ---- */
  const fileName = `certificate_${certId}.png`;
  const filePath = join(CERT_DIR, fileName);
  writeFileSync(filePath, canvas.toBuffer('image/png'));

  return `/certificates/${fileName}`;                       // << UPDATE  (shorter, nicer URL)
};
