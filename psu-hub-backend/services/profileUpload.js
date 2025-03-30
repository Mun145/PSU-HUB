const multer = require('multer');
const path = require('path');
const fs = require('fs');

const profilesDirectory = path.join(__dirname, '../uploads/profiles');
if (!fs.existsSync(profilesDirectory)) {
  fs.mkdirSync(profilesDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDirectory);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile-${Date.now()}${ext}`);
  }
});

const uploadProfile = multer({ storage });
module.exports = uploadProfile;
