const axios = require("axios");

const fetchAnalytics = async (handle) => {
    const [profileRes, ratingRes, statusRes] = await Promise.all([
        axios.get(`https://codeforces.com/api/user.info?handles=${handle}`),
        axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`),
        axios.get(`https://codeforces.com/api/user.status?handle=${handle}`)
    ]);

    if (profileRes.data.status !== "OK" || !profileRes.data.result?.length) {
        throw new Error(`Codeforces handle "${handle}" not found`);
    }

    const profile = profileRes.data.result[0];
    const contestHistory = ratingRes.data.result || [];
    const submissions = statusRes.data.result || [];

    const solvedProblems = new Set();
    const topicStats = {};

    for (const submission of submissions) {
        if (submission.verdict !== "OK") continue;

        const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
        if (solvedProblems.has(problemId)) continue;

        solvedProblems.add(problemId);

        for (const tag of submission.problem.tags || []) {
            topicStats[tag] = (topicStats[tag] || 0) + 1;
        }
    }

    return {
        handle: profile.handle,
        rating: profile.rating || 0,
        maxRating: profile.maxRating || 0,
        rank: profile.rank || "unrated",
        contestsParticipated: contestHistory.length,
        totalSolved: solvedProblems.size,
        topicStats,
        contestHistory: contestHistory.map((entry) => ({
            contestName: entry.contestName,
            rank: entry.rank,
            oldRating: entry.oldRating,
            newRating: entry.newRating,
            ratingUpdateTimeSeconds: entry.ratingUpdateTimeSeconds
        }))
    };
};

module.exports = { fetchAnalytics };
