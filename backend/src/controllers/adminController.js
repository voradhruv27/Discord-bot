// Basic controller for Admin operations.

const getAdminStats = (req, res) => {
  res.json({
    status: "active",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
};

module.exports = { getAdminStats };
