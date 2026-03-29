const request = require("supertest");
const { app, polls, voters } = require("./server");

// Clear state between tests
beforeEach(() => {
  Object.keys(polls).forEach((k) => delete polls[k]);
  Object.keys(voters).forEach((k) => delete voters[k]);
});

describe("GET /health", () => {
  it("returns status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

describe("GET /api/polls", () => {
  it("returns empty array initially", async () => {
    const res = await request(app).get("/api/polls");
    expect(res.status).toBe(200);
    expect(res.body.polls).toEqual([]);
  });

  it("returns created polls", async () => {
    await request(app).post("/api/polls").send({ title: "Test", options: ["A", "B"] });
    const res = await request(app).get("/api/polls");
    expect(res.body.polls).toHaveLength(1);
  });
});

describe("POST /api/polls", () => {
  it("creates a poll successfully", async () => {
    const res = await request(app)
      .post("/api/polls")
      .send({ title: "Best language?", options: ["JavaScript", "Python", "Go"] });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Best language?");
    expect(res.body.options).toHaveLength(3);
    expect(res.body.totalVotes).toBe(0);
  });

  it("rejects missing title", async () => {
    const res = await request(app).post("/api/polls").send({ options: ["A", "B"] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  it("rejects fewer than 2 options", async () => {
    const res = await request(app).post("/api/polls").send({ title: "X", options: ["Only one"] });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/2/);
  });

  it("rejects empty options array", async () => {
    const res = await request(app).post("/api/polls").send({ title: "X", options: [] });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/polls/:id", () => {
  it("returns a specific poll", async () => {
    const created = await request(app)
      .post("/api/polls")
      .send({ title: "Fav color?", options: ["Red", "Blue"] });
    const id = created.body.id;

    const res = await request(app).get(`/api/polls/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);
  });

  it("returns 404 for unknown poll", async () => {
    const res = await request(app).get("/api/polls/nonexistent-id");
    expect(res.status).toBe(404);
  });
});

describe("POST /api/polls/:id/vote", () => {
  let pollId, optionId;

  beforeEach(async () => {
    const res = await request(app)
      .post("/api/polls")
      .send({ title: "Favorite framework?", options: ["React", "Vue", "Angular"] });
    pollId = res.body.id;
    optionId = res.body.options[0].id;
  });

  it("registers a vote", async () => {
    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId, voterToken: "user-abc" });
    expect(res.status).toBe(200);
    expect(res.body.totalVotes).toBe(1);
    expect(res.body.options[0].votes).toBe(1);
    expect(res.body.options[0].percentage).toBe(100);
  });

  it("prevents double voting", async () => {
    await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId, voterToken: "user-xyz" });
    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId, voterToken: "user-xyz" });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already voted/i);
  });

  it("returns 404 for invalid option", async () => {
    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId: "bad-option-id" });
    expect(res.status).toBe(404);
  });

  it("returns 404 for unknown poll", async () => {
    const res = await request(app)
      .post("/api/polls/unknown-poll/vote")
      .send({ optionId: "any" });
    expect(res.status).toBe(404);
  });

  it("calculates percentage correctly with multiple votes", async () => {
    const option2 = polls[pollId].options[1].id;
    await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId, voterToken: "u1" });
    const res = await request(app)
      .post(`/api/polls/${pollId}/vote`)
      .send({ optionId: option2, voterToken: "u2" });
    expect(res.body.totalVotes).toBe(2);
    expect(res.body.options[0].percentage).toBe(50);
    expect(res.body.options[1].percentage).toBe(50);
  });
});

describe("DELETE /api/polls/:id", () => {
  it("deletes a poll", async () => {
    const created = await request(app)
      .post("/api/polls")
      .send({ title: "Delete me", options: ["Yes", "No"] });
    const id = created.body.id;

    const del = await request(app).delete(`/api/polls/${id}`);
    expect(del.status).toBe(200);

    const get = await request(app).get(`/api/polls/${id}`);
    expect(get.status).toBe(404);
  });

  it("returns 404 for non-existent poll", async () => {
    const res = await request(app).delete("/api/polls/ghost");
    expect(res.status).toBe(404);
  });
});
