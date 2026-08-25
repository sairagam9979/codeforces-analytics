import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { friendsApi } from "../api/client";

export default function Friends() {
  const [friends, setFriends] = useState([]);
  const [handle, setHandle] = useState("");
  const [lookupHandle, setLookupHandle] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const loadFriends = async () => {
    setLoading(true);
    try {
      const res = await friendsApi.list();
      setFriends(res.data.friends || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load friends");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  const addFriend = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setAdding(true);

    try {
      await friendsApi.add(handle.trim());
      setHandle("");
      setSuccess("Friend added!");
      await loadFriends();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add friend");
    } finally {
      setAdding(false);
    }
  };

  const removeFriend = async (friendHandle) => {
    try {
      await friendsApi.remove(friendHandle);
      setFriends((prev) => prev.filter((f) => f.handle !== friendHandle));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove friend");
    }
  };

  const compareWithHandle = (e) => {
    e.preventDefault();
    if (!lookupHandle.trim()) return;
    navigate(`/compare/${encodeURIComponent(lookupHandle.trim())}`);
  };

  return (
    <div>
      <h1 className="page-title">Friends</h1>
      <p className="page-subtitle">
        Add or compare anyone using their Codeforces username — no email needed
      </p>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3>Compare Any Profile</h3>
        <form onSubmit={compareWithHandle} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: "200px" }}
            placeholder="Codeforces handle e.g. tourist"
            value={lookupHandle}
            onChange={(e) => setLookupHandle(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit">
            Compare
          </button>
        </form>
      </div>

      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h3>Save to Friends List</h3>
        <form onSubmit={addFriend} style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: "200px" }}
            placeholder="Codeforces handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            required
          />
          <button className="btn btn-secondary" type="submit" disabled={adding}>
            {adding ? "Adding..." : "Add Friend"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
      </div>

      {loading ? (
        <div className="loading">Loading friends...</div>
      ) : friends.length === 0 ? (
        <div className="empty-state card">
          No saved friends yet. Enter a Codeforces handle above to compare or save.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {friends.map((friend) => (
            <div
              key={friend.handle}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                flexWrap: "wrap"
              }}
            >
              <div>
                <div style={{ fontWeight: 600 }}>@{friend.handle}</div>
                {friend.error ? (
                  <span style={{ color: "var(--warning)", fontSize: "0.85rem" }}>
                    {friend.error}
                  </span>
                ) : (
                  <div style={{ color: "var(--muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                    Rating {friend.rating} · {friend.totalSolved} solved · {friend.rank}
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Link
                  to={`/compare/${encodeURIComponent(friend.handle)}`}
                  className="btn btn-primary"
                >
                  Compare
                </Link>
                <button className="btn btn-danger" onClick={() => removeFriend(friend.handle)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
