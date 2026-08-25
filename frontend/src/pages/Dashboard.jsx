import { useEffect, useState } from "react";
import { profileApi } from "../api/client";
import { useAuth } from "../context/AuthContext";
import StatsCharts from "../components/StatsCharts";

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const [handle, setHandle] = useState(user?.codeforcesHandle || "");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadAnalytics = async () => {
    if (!user?.codeforcesHandle) return;
    setLoading(true);
    setError("");
    try {
      const res = await profileApi.getMyAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user?.codeforcesHandle]);

  const linkHandle = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await profileApi.updateHandle(handle.trim());
      updateUser(res.data.user);
      setSuccess("Codeforces handle linked!");
      const analyticsRes = await profileApi.getMyAnalytics();
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to link handle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">
        Your Codeforces profile analytics and performance insights
      </p>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3>Link Codeforces Handle</h3>
        <form onSubmit={linkHandle} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: "200px" }}
            placeholder="e.g. tourist"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {user?.codeforcesHandle ? "Update Handle" : "Link Handle"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>

      {loading && !analytics && <div className="loading">Loading analytics...</div>}

      {analytics && (
        <>
          <div className="grid-4" style={{ marginBottom: "1.5rem" }}>
            <div className="card">
              <div className="stat-value">{analytics.rating}</div>
              <div className="stat-label">Current Rating</div>
            </div>
            <div className="card">
              <div className="stat-value">{analytics.maxRating}</div>
              <div className="stat-label">Max Rating</div>
            </div>
            <div className="card">
              <div className="stat-value">{analytics.totalSolved}</div>
              <div className="stat-label">Problems Solved</div>
            </div>
            <div className="card">
              <div className="stat-value">{analytics.contestsParticipated}</div>
              <div className="stat-label">Contests</div>
            </div>
          </div>

          <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span className="badge">{analytics.rank}</span>
            <span style={{ color: "var(--muted)" }}>@{analytics.handle}</span>
          </div>

          <StatsCharts analytics={analytics} />
        </>
      )}

      {!user?.codeforcesHandle && !loading && (
        <div className="empty-state card">
          Link your Codeforces handle above to see your profile analytics and charts.
        </div>
      )}
    </div>
  );
}
