import { serve } from "@hono/node-server";
import { Hono } from "hono";

const app = new Hono();
app.get("/", (c) => {
  return c.json({ message: "Hello Hono" });
});

app.get("/api/users", (c) => {
  return c.json([{ id: 1, name: "John" }]);
});

app.get("/api/users/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ id, name: "John" });
});

app.post("/api/users", async (c) => {
  const body = await c.req.json();
  return c.json({ id: 123, ...body });
});

const server = serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log("Hono server running on http://localhost:3000");
  process.send?.("READY");
});

///
process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
process.on("SIGTERM", () => {
  server.close((err) => {
    if (err) {
      process.exit(1);
    }
    process.exit(0);
  });
});
