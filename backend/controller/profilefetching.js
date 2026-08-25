const { fetchAnalytics } = require("../services/analyticsService");

const getUserAnalytics = async (req, res, next) => {
    try {
        const handle = req.query.handle || req.body.handle;
        if (!handle) {
            return res.status(400).json({ message: "Codeforces handle is required" });
        }

        const analytics = await fetchAnalytics(handle.trim());
        return res.json(analytics);
    } catch (error) {
        if (error.message?.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

module.exports = {
    getUserAnalytics
};
