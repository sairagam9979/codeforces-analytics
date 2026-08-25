const { fetchAnalytics } = require("../services/analyticsService");

const normalizeHandle = (handle) => handle.trim().toLowerCase();

const getFriends = async (req, res) => {
    try {
        const handles = req.user.friends || [];

        const friends = await Promise.all(
            handles.map(async (handle) => {
                try {
                    const analytics = await fetchAnalytics(handle);
                    return {
                        handle: analytics.handle,
                        rating: analytics.rating,
                        maxRating: analytics.maxRating,
                        rank: analytics.rank,
                        totalSolved: analytics.totalSolved
                    };
                } catch {
                    return { handle, error: "Could not fetch profile" };
                }
            })
        );

        return res.json({ friends });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

const addFriend = async (req, res) => {
    const { handle } = req.body;

    if (!handle?.trim()) {
        return res.status(400).json({ message: "Codeforces handle is required" });
    }

    const normalizedHandle = normalizeHandle(handle);

    if (
        req.user.codeforcesHandle &&
        normalizedHandle === req.user.codeforcesHandle.toLowerCase()
    ) {
        return res.status(400).json({ message: "You cannot add yourself as a friend" });
    }

    try {
        const analytics = await fetchAnalytics(normalizedHandle);

        if (req.user.friends.includes(normalizedHandle)) {
            return res.status(400).json({ message: "Already in your friends list" });
        }

        req.user.friends.push(normalizedHandle);
        await req.user.save();

        return res.status(201).json({
            message: "Friend added successfully",
            friend: {
                handle: analytics.handle,
                rating: analytics.rating,
                maxRating: analytics.maxRating,
                rank: analytics.rank,
                totalSolved: analytics.totalSolved
            }
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Invalid Codeforces handle"
        });
    }
};

const removeFriend = async (req, res) => {
    const normalizedHandle = normalizeHandle(req.params.handle);

    try {
        const index = req.user.friends.indexOf(normalizedHandle);
        if (index === -1) {
            return res.status(404).json({ message: "Friend not found" });
        }

        req.user.friends.splice(index, 1);
        await req.user.save();

        return res.json({ message: "Friend removed successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getFriends,
    addFriend,
    removeFriend
};
