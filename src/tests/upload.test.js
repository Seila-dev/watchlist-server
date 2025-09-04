import { jest } from "@jest/globals";
import * as r2 from "../storage/ConfigR2.js"; // ajusta caminho se necessário
import request from "supertest";
import { app } from "../server.js"; // apenas o app, sem app.listen()

describe("Upload", () => {
  beforeAll(() => {
    // mock manual da função uploadToR2
    r2.uploadToR2 = jest.fn().mockResolvedValue(
      "https://fakeaccount.r2.cloudflarestorage.com/fakebucket/test.png"
    );
  });

  it("deve retornar URL após upload", async () => {
    const res = await request(app)
      .post("/upload")
      .attach("file", Buffer.from("hello"), "test.png");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty(
      "url",
      "https://fakeaccount.r2.cloudflarestorage.com/fakebucket/test.png"
    );

    // verificar se o mock foi chamado corretamente
    expect(r2.uploadToR2).toHaveBeenCalled();
  });
});
