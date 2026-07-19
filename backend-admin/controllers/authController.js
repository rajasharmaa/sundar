const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const crypto = require('crypto');

// Throw initialization error if password hash is missing
if (!process.env.ADMIN_PASSWORD_HASH) {
  console.error('❌ CRITICAL CONFIGURATION ERROR: ADMIN_PASSWORD_HASH is not set!');
  process.exit(1);
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        error: 'Username and password are required'
      });
    }

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    if (username !== adminUsername) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const isMatch = await bcrypt.compare(password, adminPasswordHash);

    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token with longer expiration for admin panel
    const token = jwt.sign(
      { username: username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { username: username },
      process.env.REFRESH_SECRET,
      { expiresIn: process.env.REFRESH_EXPIRES_IN || '30d' }
    );

    // Store refresh token in MongoDB
    try {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const db = mongoose.connection.db;
      if (db) {
        const expiresInMs = 30 * 24 * 60 * 60 * 1000; // 30 days
        await db.collection('refresh_tokens').insertOne({
          userId: 'admin',
          tokenHash: tokenHash,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + expiresInMs),
          userAgent: req.headers['user-agent'] || '',
          ipAddress: req.ip || req.connection?.remoteAddress || '',
          revoked: false
        });
      }
    } catch (dbError) {
      console.error('Failed to store admin refresh token in MongoDB:', dbError.message);
    }

    const isProd = process.env.NODE_ENV === 'production';
    res.cookie('adminToken', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.cookie('adminRefreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      message: 'Login successful',
      token: token,
      refreshToken: refreshToken,
      redirect: '/admin'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies?.adminRefreshToken || req.body?.refreshToken;
    if (refreshToken) {
      try {
        const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
        const db = mongoose.connection.db;
        if (db) {
          await db.collection('refresh_tokens').updateOne(
            { tokenHash },
            { $set: { revoked: true, revokedAt: new Date(), revokedReason: 'admin_logout' } }
          );
        }
      } catch (err) {
        console.error('Failed to revoke admin refresh token on logout:', err.message);
      }
    }

    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('adminToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    });
    res.clearCookie('adminRefreshToken', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax'
    });

    res.json({
      message: 'Logout successful',
      redirect: '/admin-login'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const checkStatus = async (req, res) => {
  try {
    let token = req.headers.authorization?.split(' ')[1];
    if (!token && req.cookies) {
      token = req.cookies.adminToken;
    }
    
    if (!token) {
      return res.json({ authenticated: false });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.json({
        authenticated: true,
        username: decoded.username
      });
    } catch (err) {
      // Token expired - check if we can refresh
      res.json({ authenticated: false, tokenExpired: true });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.adminRefreshToken || req.body?.refreshToken;
    
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
      
      // Database check validating token hash matches an active record
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
      const db = mongoose.connection.db;
      
      if (!db) {
        return res.status(503).json({ error: 'Database service temporarily unavailable' });
      }
      
      const tokenRecord = await db.collection('refresh_tokens').findOne({ tokenHash });
      
      if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
        return res.status(401).json({ error: 'Invalid, expired, or revoked refresh token' });
      }

      // Generate new access token
      const newToken = jwt.sign(
        { username: decoded.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('adminToken', newToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      res.json({
        success: true,
        token: newToken
      });
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  login,
  logout,
  checkStatus,
  refreshToken
};