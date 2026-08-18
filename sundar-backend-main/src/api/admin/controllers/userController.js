const { User } = require('../../../models');

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch users' 
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user' 
    });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user,
      message: 'User status updated successfully'
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update user status' 
    });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update user role' 
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete user' 
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false })
    ]);
    
    // New users this month
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: thisMonth }
    });
    
    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        newUsersThisMonth
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user statistics' 
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserStats
};
