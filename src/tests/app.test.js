import request from "supertest";
import { app } from "../server.js";

describe("API", () => {
  it("deve responder na rota /health", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });
});