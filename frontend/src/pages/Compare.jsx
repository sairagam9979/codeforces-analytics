import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { profileApi } from "../api/client";
import { CompareCharts } from "../components/StatsCharts";

export default function Compare() {
  const { handle } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await profileApi.compare(decodeURIComponent(handle));
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load comparison");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [handle]);

  if (loading) return <div className="loading">Loading comparison...</div>;

  if (error) {
    return (
      <div>
        <p className="error">{error}</p>
        <Link to="/friends" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
          Back to Friends
        </Link>
      </div>
    );
  }

  const { you, friend, comparison } = data;

  return (
    <div>
      <div style={{ marginBottom: "1.5rem" }}>
        <Link to="/friends" style={{ color: "var(--accent)", fontSize: "0.9rem" }}>
          ← Back to Friends
        </Link>
        <h1 className="page-title" style={{ marginTop: "0.5rem" }}>
          {you.name} vs @{friend.handle}
        </h1>
        <p className="page-subtitle">
          @{you.handle} compared with @{friend.handle}
        </p>
      </div>

      <div className="grid-3" style={{ marginBottom: "1.5rem" }}>
        <div className="card">
          <div
            className="stat-value"
            style={{ color: comparison.ratingDiff >= 0 ? "var(--success)" : "var(--danger)" }}
          >
            {comparison.ratingDiff >= 0 ? "+" : ""}
            {comparison.ratingDiff}
          </div>
          <div className="stat-label">Rating Difference</div>
        </div>
        <div className="card">
          <div
            className="stat-value"
            style={{ color: comparison.solvedDiff >= 0 ? "var(--success)" : "var(--danger)" }}
          >
            {comparison.solvedDiff >= 0 ? "+" : ""}
            {comparison.solvedDiff}
          </div>
          <div className="stat-label">Problems Solved Difference</div>
        </div>
        <div className="card">
          <div
            className="stat-value"
            style={{ color: comparison.contestDiff >= 0 ? "var(--success)" : "var(--danger)" }}
          >
            {comparison.contestDiff >= 0 ? "+" : ""}
            {comparison.contestDiff}
          </div>
          <div className="stat-label">Contest Difference</div>
        </div>
      </div>

      <CompareCharts comparison={data} />

      <div style={{ marginTop: "1.5rem" }}>
        <Link
          to="/recommendations"
          state={{ friendHandle: friend.handle }}
          className="btn btn-primary"
        >
          Get AI Recommendations with @{friend.handle}
        </Link>
      </div>
    </div>
  );
}
