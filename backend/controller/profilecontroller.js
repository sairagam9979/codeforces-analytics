const { fetchAnalytics } = require("../services/analyticsService");

const buildComparison = (userAnalytics, friendAnalytics, userName, friendName) => {
    const allTopics = new Set([
        ...Object.keys(userAnalytics.topicStats),
        ...Object.keys(friendAnalytics.topicStats)
    ]);

    const topicComparison = [...allTopics]
        .map((topic) => ({
            topic,
            you: userAnalytics.topicStats[topic] || 0,
            friend: friendAnalytics.topicStats[topic] || 0
        }))
        .sort((a, b) => b.you + b.friend - (a.you + a.friend))
        .slice(0, 12);

    return {
        you: {
            name: userName,
            handle: userAnalytics.handle,
            ...userAnalytics
        },
        friend: {
            name: friendName,
            handle: friendAnalytics.handle,
            ...friendAnalytics
        },
        comparison: {
            ratingDiff: userAnalytics.rating - friendAnalytics.rating,
            solvedDiff: userAnalytics.totalSolved - friendAnalytics.totalSolved,
            contestDiff:
                userAnalytics.contestsParticipated - friendAnalytics.contestsParticipated,
            topicComparison
        }
    };
};

const updateHandle = async (req, res) => {
    const { handle } = req.body;

    if (!handle?.trim()) {
        return res.status(400).json({ message: "Codeforces handle is required" });
    }

    try {
        const analytics = await fetchAnalytics(handle.trim());
        req.user.codeforcesHandle = analytics.handle;
        await req.user.save();

        return res.json({
            message: "Codeforces handle linked successfully",
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                codeforcesHandle: req.user.codeforcesHandle
            }
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Invalid Codeforces handle"
        });
    }
};

const getMyAnalytics = async (req, res, next) => {
    if (!req.user.codeforcesHandle) {
        return res.status(400).json({
            message: "Please link your Codeforces handle first"
        });
    }

    try {
        const analytics = await fetchAnalytics(req.user.codeforcesHandle);
        return res.json(analytics);
    } catch (error) {
        next(error);
    }
};

const compareWithHandle = async (req, res, next) => {
    const friendHandle = req.params.handle?.trim();

    if (!friendHandle) {
        return res.status(400).json({ message: "Codeforces handle is required" });
    }

    if (!req.user.codeforcesHandle) {
        return res.status(400).json({
            message: "Please link your Codeforces handle first"
        });
    }

    try {
        const [userAnalytics, friendAnalytics] = await Promise.all([
            fetchAnalytics(req.user.codeforcesHandle),
            fetchAnalytics(friendHandle)
        ]);

        return res.json(
            buildComparison(
                userAnalytics,
                friendAnalytics,
                req.user.name,
                friendAnalytics.handle
            )
        );
    } catch (error) {
        if (error.message?.includes("not found")) {
            return res.status(404).json({ message: error.message });
        }
        next(error);
    }
};

module.exports = {
    updateHandle,
    getMyAnalytics,
    compareWithHandle
};
