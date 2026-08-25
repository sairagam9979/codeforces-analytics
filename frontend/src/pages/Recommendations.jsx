import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { friendsApi, recommendationsApi } from "../api/client";

export default function Recommendations() {
  const location = useLocation();
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(location.state?.friendHandle || "");
  const [customHandle, setCustomHandle] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    friendsApi.list().then((res) => {
      setFriends((res.data.friends || []).filter((f) => f.handle && !f.error));
    });
  }, []);

  const generate = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const friendHandle = customHandle.trim() || selectedFriend || null;
      const res = await recommendationsApi.generate(friendHandle);
      setResult(res.data);
    } catch (err) {
      const msg = err.response?.data?.message;
      const detail = err.response?.data?.error;
      setError(detail ? `${msg}: ${detail}` : msg || "Failed to generate recommendations");
    } finally {
      setLoading(false);
    }
  };

  const rec = result?.recommendations;

  return (
    <div>
      <h1 className="page-title">AI Coach</h1>
      <p className="page-subtitle">
        Personalized practice recommendations powered by Gemini AI
      </p>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3>Generate Recommendations</h3>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label className="label">Saved friend (optional)</label>
            <select
              className="input"
              value={selectedFriend}
              onChange={(e) => {
                setSelectedFriend(e.target.value);
                setCustomHandle("");
              }}
            >
              <option value="">Solo analysis</option>
              {friends.map((f) => (
                <option key={f.handle} value={f.handle}>
                  @{f.handle}
                </option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label className="label">Or any Codeforces handle</label>
            <input
              className="input"
              placeholder="e.g. tourist"
              value={customHandle}
              onChange={(e) => {
                setCustomHandle(e.target.value);
                setSelectedFriend("");
              }}
            />
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={loading}>
            {loading ? "Analyzing..." : "Generate Plan"}
          </button>
        </div>
        {error && <p className="error">{error}</p>}
      </div>

      {result?.source?.startsWith("local-fallback") && (
        <div className="card" style={{ marginBottom: "1rem", borderColor: "rgba(245, 166, 35, 0.4)" }}>
          <h3 style={{ color: "var(--warning)" }}>Fallback mode</h3>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            Gemini is currently unavailable or rate-limited, so the app is showing rule-based recommendations from your profile data.
            You can still review the plan below, and AI-generated insights will return once the quota or key issue is resolved.
          </p>
        </div>
      )}

      {rec && (
        <div style={{ display: "grid", gap: "1rem" }}>
          <div className="card">
            <h3>Summary</h3>
            <p style={{ lineHeight: 1.6, margin: 0 }}>{rec.summary}</p>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3>Strengths</h3>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.8 }}>
                {(rec.strengths || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="card">
              <h3>Areas to Improve</h3>
              <ul style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.8 }}>
                {(rec.weaknesses || []).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          </div>

          {rec.recommendedTopics?.length > 0 && (
            <div className="card">
              <h3>Recommended Topics</h3>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {rec.recommendedTopics.map((topic) => (
                  <span key={topic} className="badge">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {rec.practicePlan?.length > 0 && (
            <div className="card">
              <h3>2-Week Practice Plan</h3>
              <div style={{ display: "grid", gap: "1rem" }}>
                {rec.practicePlan.map((week) => (
                  <div
                    key={week.week}
                    style={{
                      background: "var(--surface-2)",
                      borderRadius: "10px",
                      padding: "1rem",
                      border: "1px solid var(--border)"
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: "0.35rem" }}>
                      Week {week.week}: {week.focus}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "1.25rem", color: "var(--muted)" }}>
                      {(week.tasks || []).map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rec.problemSuggestions?.length > 0 && (
            <div className="card">
              <h3>Problem Suggestions</h3>
              <div style={{ display: "grid", gap: "0.75rem" }}>
                {rec.problemSuggestions.map((p, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "0.85rem",
                      background: "var(--surface-2)",
                      borderRadius: "8px",
                      border: "1px solid var(--border)"
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      {p.topic}{" "}
                      <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                        ({p.difficulty})
                      </span>
                    </div>
                    <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                      {p.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rec.friendInsights && rec.friendInsights !== "null" && (
            <div className="card">
              <h3>Friend Comparison Insights</h3>
              <p style={{ margin: 0, lineHeight: 1.6 }}>{rec.friendInsights}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
