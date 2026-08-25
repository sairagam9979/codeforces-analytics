const { GoogleGenerativeAI } = require("@google/generative-ai");
const { fetchAnalytics } = require("../services/analyticsService");
const { buildLocalRecommendations } = require("../services/localRecommendations");

const resolveGeminiApiKey = () => {
  const candidates = [
    process.env.GEMINI_API_KEY,
    process.env.GOOGLE_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.GOOGLE_GENAI_API_KEY
  ];

  return candidates.find((value) => typeof value === "string" && value.trim());
};

const buildPrompt = (user, userAnalytics, friendContext) => {
  const topTopics = Object.entries(userAnalytics.topicStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }));

  const weakTopics = Object.entries(userAnalytics.topicStats)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  return `You are an expert competitive programming coach analyzing a Codeforces profile.

User: ${user.name} (@${userAnalytics.handle})
- Current rating: ${userAnalytics.rating}
- Max rating: ${userAnalytics.maxRating}
- Rank: ${userAnalytics.rank}
- Problems solved: ${userAnalytics.totalSolved}
- Contests participated: ${userAnalytics.contestsParticipated}
- Strong topics: ${JSON.stringify(topTopics)}
- Weak/sparse topics: ${JSON.stringify(weakTopics)}
${friendContext ? `
Friend for comparison: ${friendContext.name} (@${friendContext.handle})
- Rating: ${friendContext.rating}
- Problems solved: ${friendContext.totalSolved}
- Top topics: ${JSON.stringify(friendContext.topTopics)}
` : ""}

Provide a structured coaching plan in JSON with this exact shape:
{
  "summary": "2-3 sentence overview",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "recommendedTopics": ["topic1", "topic2", "topic3"],
  "practicePlan": [
    { "week": 1, "focus": "topic or skill", "tasks": ["task1", "task2"] },
    { "week": 2, "focus": "topic or skill", "tasks": ["task1", "task2"] }
  ],
  "problemSuggestions": [
    { "topic": "dp", "difficulty": "1200-1400", "reason": "why this helps" }
  ],
  "friendInsights": "comparison insight or null if no friend"
}

Return only valid JSON, no markdown.`;
};

const parseJsonResponse = (response) => {
  let text = "";

  if (!response) {
    throw new Error("Empty AI response");
  }

  if (typeof response === "string") {
    text = response;
  } else if (typeof response.text === "function") {
    text = response.text();
  } else if (typeof response.text === "string") {
    text = response.text;
  } else if (response.response && typeof response.response.text === "function") {
    text = response.response.text();
  } else if (response.response && typeof response.response === "string") {
    text = response.response;
  } else if (typeof response.outputText === "string") {
    text = response.outputText;
  } else {
    text = JSON.stringify(response);
  }

  const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned);
};

const getRecommendations = async (req, res) => {
  const { friendHandle } = req.body;
  const apiKey = resolveGeminiApiKey();

  if (!apiKey) {
    return res.status(503).json({
      message: "Gemini API key is not configured. Add GEMINI_API_KEY or GOOGLE_API_KEY to your backend/.env or project root .env file."
    });
  }

  if (!req.user.codeforcesHandle) {
    return res.status(400).json({
      message: "Please link your Codeforces handle first"
    });
  }

  try {
    const userAnalytics = await fetchAnalytics(req.user.codeforcesHandle);
    let friendContext = null;

    if (friendHandle?.trim()) {
      const normalizedHandle = friendHandle.trim().toLowerCase();
      const friendAnalytics = await fetchAnalytics(normalizedHandle);
      friendContext = {
        name: friendAnalytics.handle,
        handle: friendAnalytics.handle,
        rating: friendAnalytics.rating,
        totalSolved: friendAnalytics.totalSolved,
        topTopics: Object.entries(friendAnalytics.topicStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 8)
          .map(([topic, count]) => ({ topic, count }))
      };
    }

    let recommendations;
    let source = "gemini";

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const result = await model.generateContent(
        buildPrompt(req.user, userAnalytics, friendContext)
      );
      recommendations = parseJsonResponse(result.response.text());
    } catch (geminiError) {
      const status = geminiError.status || geminiError.statusCode;
      console.error("Gemini recommendation error:", geminiError.message);

      if (status === 400 || status === 401 || status === 403) {
        return res.status(502).json({
          message: "Invalid Gemini API key. Check GEMINI_API_KEY in .env",
          error: geminiError.message
        });
      }

      recommendations = buildLocalRecommendations(userAnalytics, friendContext);
      source = status === 429 ? "local-fallback-quota" : "local-fallback";
    }

    return res.json({
      handle: userAnalytics.handle,
      generatedAt: new Date().toISOString(),
      source,
      recommendations
    });
  } catch (error) {
    console.error("Recommendation error:", error.message);
    return res.status(500).json({
      message: "Failed to generate recommendations",
      error: error.message
    });
  }
};

module.exports = { getRecommendations };
