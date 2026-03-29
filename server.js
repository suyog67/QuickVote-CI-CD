const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── In-Memory Store ──────────────────────────────────────────────────────────
// Shape: { [pollId]: { id, title, createdAt, options: [{ id, text, votes }] } }
const polls = {};

// Tracks IPs/voter tokens per poll to prevent double-voting
// Shape: { [pollId]: Set<voterToken> }
const voters = {};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getPollSummary(poll) {
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
  return {
    ...poll,
    totalVotes,
    options: poll.options.map((o) => ({
      ...o,
      percentage: totalVotes > 0 ? Math.round((o.votes / totalVotes) * 100) : 0,
    })),
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check (used by CI/CD pipelines)
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), polls: Object.keys(polls).length });
});

// GET all polls
app.get("/api/polls", (req, res) => {
  const all = Object.values(polls).map(getPollSummary);
  res.json({ polls: all });
});

// GET single poll
app.get("/api/polls/:id", (req, res) => {
  const poll = polls[req.params.id];
  if (!poll) return res.status(404).json({ error: "Poll not found" });
  res.json(getPollSummary(poll));
});

// POST create poll
app.post("/api/polls", (req, res) => {
  const { title, options } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ error: "Poll title is required" });
  }
  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: "At least 2 options are required" });
  }

  const sanitizedOptions = options
    .map((o) => (typeof o === "string" ? o.trim() : ""))
    .filter((o) => o.length > 0);

  if (sanitizedOptions.length < 2) {
    return res.status(400).json({ error: "At least 2 non-empty options required" });
  }

  const id = uuidv4();
  polls[id] = {
    id,
    title: title.trim(),
    createdAt: new Date().toISOString(),
    options: sanitizedOptions.map((text) => ({ id: uuidv4(), text, votes: 0 })),
  };
  voters[id] = new Set();

  res.status(201).json(getPollSummary(polls[id]));
});

// POST vote on a poll
app.post("/api/polls/:id/vote", (req, res) => {
  const poll = polls[req.params.id];
  if (!poll) return res.status(404).json({ error: "Poll not found" });

  const { optionId, voterToken } = req.body;
  if (!optionId) return res.status(400).json({ error: "optionId is required" });

  // Prevent double voting
  if (voterToken && voters[poll.id].has(voterToken)) {
    return res.status(409).json({ error: "You have already voted in this poll" });
  }

  const option = poll.options.find((o) => o.id === optionId);
  if (!option) return res.status(404).json({ error: "Option not found" });

  option.votes += 1;
  if (voterToken) voters[poll.id].add(voterToken);

  res.json(getPollSummary(poll));
});

// DELETE a poll
app.delete("/api/polls/:id", (req, res) => {
  if (!polls[req.params.id]) return res.status(404).json({ error: "Poll not found" });
  delete polls[req.params.id];
  delete voters[req.params.id];
  res.json({ message: "Poll deleted" });
});

// Serve frontend for all other routes (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── Start ────────────────────────────────────────────────────────────────────
// const server = app.listen(PORT, () => {
//   console.log(`🗳️  Voting App running on http://localhost:${PORT}`);
// });

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🗳️  Voting App running on http://localhost:${PORT}`);
  });
}


module.exports = { app, polls, voters }; // exported for tests
