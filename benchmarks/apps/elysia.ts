import { Elysia } from "elysia";
import { node } from "@elysiajs/node";

const app = new Elysia({ adapter: node() });

app.get("/", () => {
  return { message: "Hello Elysia" };
});

app.get("/api/users", () => {
  return { id: 1, name: "John" };
});

app.get("/api/users/:id", ({ params: { id } }) => {
  return { id, name: "John" };
});

app.post("/api/users", async ({ body }) => {
  return { id: 123, ...(body as any) };
});

app.listen(3000, ({ hostname, port }) => {
  console.log("Elysia server running on http://localhost:3000");
  process.send?.("READY");
});
