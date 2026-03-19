const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Complaint = require('../models/Complaint');
const { protect, admin } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname.replace(/\\s+/g, '-')}`);
  }
});

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Images Only!');
    }
  }
});

const assignDepartment = (category) => {
  switch(category) {
    case 'Garbage': return 'Sanitation Department';
    case 'Road Damage': return 'Road Maintenance';
    case 'Water Leakage': return 'Water Supply';
    case 'Streetlight Issue': return 'Electrical Department';
    default: return 'General Department';
  }
};

router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { title, category, description, lat, lng, latitude, longitude, address } = req.body;
    
    const latNum = parseFloat(latitude || lat);
    const lngNum = parseFloat(longitude || lng);
    const department = assignDepartment(category);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = new Complaint({
      title,
      category,
      description,
      latitude: latNum,
      longitude: lngNum,
      address,
      department,
      image: imageUrl,
      userId: req.user.id
    });

    const createdComplaint = await complaint.save();
    
    if(req.app.get('io')) {
       req.app.get('io').emit('newComplaint', createdComplaint);
    }
    
    res.status(201).json(createdComplaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    if (req.query.user === 'true') {
      query.userId = req.user.id;
    }
    
    const complaints = await Complaint.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (complaint) {
      complaint.status = status || complaint.status;
      const updatedComplaint = await complaint.save();
      
      if(req.app.get('io')) {
        req.app.get('io').emit('statusUpdate', updatedComplaint);
      }
      
      res.json(updatedComplaint);
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (complaint) {
      await complaint.deleteOne();
      
      if(req.app.get('io')) {
        req.app.get('io').emit('complaintDeleted', req.params.id);
      }
      
      res.json({ message: 'Complaint removed' });
    } else {
      res.status(404).json({ message: 'Complaint not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
