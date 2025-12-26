const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  createAdmin
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are admin only
router.use(protect, admin);

router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.post('/admin', createAdmin);

module.exports = router;
