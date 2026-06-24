const express = require('express');
const router = express.Router();

// GET /api/config/taskforce
// Returns public taskforce info — no auth needed
router.get('/taskforce', (req, res) => {
  res.json({
    name: process.env.TASKFORCE_NAME || 'CampusCycle Taskforce',
    upi: process.env.TASKFORCE_UPI || 'campuscycle@upi',
    pickup: process.env.TASKFORCE_PICKUP || 'Student Activity Centre (SAC), Ground Floor',
    pickupShort: process.env.TASKFORCE_PICKUP_SHORT || 'SAC, Ground Floor',
    hours: process.env.TASKFORCE_HOURS || 'Mon–Sat, 10 AM – 5 PM',
  });
});

module.exports = router;