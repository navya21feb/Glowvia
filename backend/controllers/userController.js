import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/users  (admin)
export const getUsers = asyncHandler(async (req, res) => {
  res.json({ users: await User.find().sort('-createdAt') });
});

// PUT /api/users/:id/role  (admin)
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'vendor', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error("You can't change your own role");
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ message: `${user.name} is now a ${role}`, user });
});

// DELETE /api/users/:id  (admin)
export const deleteUser = asyncHandler(async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    res.status(400);
    throw new Error("You can't delete your own account");
  }
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});
