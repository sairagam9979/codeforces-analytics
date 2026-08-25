import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend
} from "recharts";

const COLORS = ["#5b8cff", "#7c5cff", "#3ecf8e", "#f5a623", "#ff6b6b", "#4ecdc4", "#a78bfa", "#fb7185"];

const formatDate = (seconds) => {
  if (!seconds) return "";
  return new Date(seconds * 1000).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit"
  });
};

export default function StatsCharts({ analytics }) {
  if (!analytics) return null;

  const topicData = Object.entries(analytics.topicStats || {})
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const ratingData = (analytics.contestHistory || [])
    .slice(-15)
    .map((entry) => ({
      name: formatDate(entry.ratingUpdateTimeSeconds),
      rating: entry.newRating
    }));

  const pieData = topicData.slice(0, 6);

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div className="grid-2">
        <div className="card">
          <h3>Rating Progress</h3>
          {ratingData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={ratingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3550" />
                <XAxis dataKey="name" stroke="#8b97b3" fontSize={12} />
                <YAxis stroke="#8b97b3" fontSize={12} domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    background: "#1a2236",
                    border: "1px solid #2a3550",
                    borderRadius: "8px"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="rating"
                  stroke="#5b8cff"
                  strokeWidth={2}
                  dot={{ fill: "#5b8cff", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No contest history yet</div>
          )}
        </div>

        <div className="card">
          <h3>Topic Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="topic"
                  cx="50%"
                  cy="50%"
                  outerRadius={95}
                  label={({ topic, percent }) =>
                    `${topic} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#1a2236",
                    border: "1px solid #2a3550",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No solved problems with tags</div>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Problems Solved by Topic</h3>
        {topicData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topicData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3550" />
              <XAxis type="number" stroke="#8b97b3" fontSize={12} />
              <YAxis
                type="category"
                dataKey="topic"
                stroke="#8b97b3"
                fontSize={12}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a2236",
                  border: "1px solid #2a3550",
                  borderRadius: "8px"
                }}
              />
              <Bar dataKey="count" fill="#7c5cff" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">No topic data available</div>
        )}
      </div>
    </div>
  );
}

export function CompareCharts({ comparison }) {
  if (!comparison) return null;

  const { you, friend, comparison: stats } = comparison;

  const overviewData = [
    { metric: "Rating", you: you.rating, friend: friend.rating },
    { metric: "Max Rating", you: you.maxRating, friend: friend.maxRating },
    { metric: "Solved", you: you.totalSolved, friend: friend.totalSolved },
    { metric: "Contests", you: you.contestsParticipated, friend: friend.contestsParticipated }
  ];

  const topicData = stats.topicComparison || [];

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <div className="card">
        <h3>Profile Overview — {you.name} vs {friend.name}</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={overviewData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a3550" />
            <XAxis dataKey="metric" stroke="#8b97b3" fontSize={12} />
            <YAxis stroke="#8b97b3" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: "#1a2236",
                border: "1px solid #2a3550",
                borderRadius: "8px"
              }}
            />
            <Legend />
            <Bar dataKey="you" name={you.name} fill="#5b8cff" radius={[6, 6, 0, 0]} />
            <Bar dataKey="friend" name={friend.name} fill="#7c5cff" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {topicData.length > 0 && (
        <div className="card">
          <h3>Topic Comparison</h3>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={topicData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a3550" />
              <XAxis dataKey="topic" stroke="#8b97b3" fontSize={11} angle={-25} textAnchor="end" height={70} />
              <YAxis stroke="#8b97b3" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#1a2236",
                  border: "1px solid #2a3550",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Bar dataKey="you" name={you.name} fill="#5b8cff" radius={[4, 4, 0, 0]} />
              <Bar dataKey="friend" name={friend.name} fill="#3ecf8e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
