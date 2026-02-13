import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import type { Server } from "node:http";
import { createTestApp } from "./setup";

describe("Pia Tests", () => {
  let server: Server;
  let baseUrl: string;

  before(async () => {
    const app = createTestApp();
    server = app.serve(0);
    await new Promise<void>((resolve) => {
      server.on("listening", () => {
        console.log(`Test server listening `);
        resolve();
      });
    });
    const addr = server.address();
    if (addr && typeof addr === "object") {
      baseUrl = `http://localhost:${addr.port}`;
      console.log(baseUrl);
    } else {
      throw new Error("Server address is not available");
    }
  });
  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log("Test server closed");
          resolve();
        });
      });
    }
  });
  ///
  it("should respond with text", async () => {
    const res = await fetch(`${baseUrl}/`);
    const text = await res.text();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get("content-type"), "text/plain");
    assert.strictEqual(text, "Hello Pia");
  });
  ///
  it("should return JSON array from /users", async () => {
    const res = await fetch(`${baseUrl}/users`);
    const data = await res.json();

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get("content-type"), "application/json");
    assert.ok(Array.isArray(data));
    assert.strictEqual(data.length, 2);
    assert.deepStrictEqual(data[0], { id: 1, name: "John" });
  });
  ///
  it("should create user with POST", async () => {
    const userData = { name: "Alice", email: "alice@example.com" };
    const response = await fetch(`${baseUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const data = (await response.json()) as { id: number; name: string; email: string };
    assert.strictEqual(response.status, 201);
    assert.strictEqual(typeof data.id, "number");
    assert.strictEqual(data.name, userData.name);
    assert.strictEqual(data.email, userData.email);
  });
  ///
  it("should handle query parameters", async () => {
    const response = await fetch(`${baseUrl}/search?q=pia`);
    const data = (await response.json()) as { query: string; results: unknown[] };
    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.query, "pia");
    assert.deepStrictEqual(data.results, []);
  });

  it("should handle route parameters", async () => {
    const response = await fetch(`${baseUrl}/users/123`);
    const data = (await response.json()) as { id: string; name: string };

    assert.strictEqual(response.status, 200);
    assert.strictEqual(data.id, "123");
    assert.strictEqual(data.name, "User 123");
  });

  it("should return 404 for unknown routes", async () => {
    const response = await fetch(`${baseUrl}/unknown-route`);
    assert.strictEqual(response.status, 404);
  });
});
