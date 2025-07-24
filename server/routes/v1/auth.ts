import express from 'express';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;

    // Input validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check for password strength
    if (password.length < 12) {
      return res.status(400).json({
        message: "Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character",
      });
    }

    // Mock user creation
    const user = {
      id: Math.floor(Math.random() * 10000),
      username,
      email,
      firstName,
      lastName,
      role: "user",
      active: true,
      createdAt: new Date().toISOString()
    };

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Mock authentication
    if (username === "admin" && password === "password123") {
      const token = "mock-jwt-token-" + Math.random().toString(36).substr(2, 9);
      return res.status(200).json({
        message: "Login successful",
        token,
        user: { id: 1, username, role: "admin" }
      });
    }

    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    // Mock session invalidation
    return res.status(200).json({
      message: "Logout successful"
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ message: "Logout failed" });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const user = {
      id: 1,
      username: "admin",
      email: "admin@flowai.com",
      role: "admin",
      active: true
    };
    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to get user" });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({
        message: "New password must be at least 12 characters long"
      });
    }

    // Mock password change
    return res.status(200).json({
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Change password error:", error);
    return res.status(500).json({ message: "Failed to change password" });
  }
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Mock password reset email
    return res.status(200).json({
      message: "Password reset email sent"
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ message: "Failed to send reset email" });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (newPassword.length < 12) {
      return res.status(400).json({
        message: "New password must be at least 12 characters long"
      });
    }

    // Mock password reset
    return res.status(200).json({
      message: "Password reset successfully"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ message: "Failed to reset password" });
  }
});

export default router; 