const buildLocalRecommendations = (userAnalytics, friendContext = null) => {
  const topics = Object.entries(userAnalytics.topicStats || {})
    .sort((a, b) => b[1] - a[1]);

  const strongTopics = topics.slice(0, 3).map(([topic]) => topic);
  const weakTopics = topics.length
    ? [...topics].sort((a, b) => a[1] - b[1]).slice(0, 3).map(([topic]) => topic)
    : ["dp", "graphs", "math"];

  const rating = userAnalytics.rating || 1200;
  const difficultyRange = `${Math.max(800, rating - 200)}-${rating + 200}`;

  let friendInsights = null;
  if (friendContext) {
    const ratingDiff = rating - friendContext.rating;
    const solvedDiff = userAnalytics.totalSolved - friendContext.totalSolved;
    friendInsights =
      ratingDiff >= 0
        ? `You are ${ratingDiff} rating points ahead of @${friendContext.handle} and have solved ${solvedDiff} more problems. Focus on maintaining consistency in contests.`
        : `You are ${Math.abs(ratingDiff)} rating points behind @${friendContext.handle}. Closing the gap on ${weakTopics[0]} would help most.`;
  }

  return {
    summary: `Based on your Codeforces profile (@${userAnalytics.handle}), you have solved ${userAnalytics.totalSolved} problems with a rating of ${userAnalytics.rating}. Your strongest areas are ${strongTopics.join(", ") || "still developing"}, while ${weakTopics.join(", ")} need more practice.`,
    strengths: strongTopics.length
      ? strongTopics.map((t) => `Solid practice in ${t}`)
      : ["Active participation on Codeforces"],
    weaknesses: weakTopics.map((t) => `Limited solved problems in ${t}`),
    recommendedTopics: weakTopics,
    practicePlan: [
      {
        week: 1,
        focus: weakTopics[0] || "fundamentals",
        tasks: [
          `Solve 5 problems tagged ${weakTopics[0] || "implementation"} in the ${difficultyRange} range`,
          "Review editorial solutions for problems you could not solve within 45 minutes"
        ]
      },
      {
        week: 2,
        focus: weakTopics[1] || "contest skills",
        tasks: [
          `Solve 5 problems tagged ${weakTopics[1] || "greedy"} in the ${difficultyRange} range`,
          "Participate in at least one Codeforces contest and upsolve 2 problems"
        ]
      }
    ],
    problemSuggestions: weakTopics.slice(0, 3).map((topic) => ({
      topic,
      difficulty: difficultyRange,
      reason: `You have fewer solved problems in ${topic} compared to your other topics`
    })),
    friendInsights
  };
};

module.exports = { buildLocalRecommendations };
