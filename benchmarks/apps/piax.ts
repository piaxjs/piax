import { Piax } from "piax";

const app = new Piax();
app.get("/", (ctx) => {
  return ctx.json({ message: "Hello Pia" });
});

app.get("/api/users", (ctx) => {
  return ctx.json([{ id: 1, name: "John" }]);
});

app.get("/api/users/:id", (ctx) => {
  const { id } = ctx.params;
  return ctx.json({ id, name: "John" });
});

app.post("/api/users", async (ctx) => {
  return ctx.json({ id: 123, ...(ctx.body as Record<string, unknown>) });
});

app.serve(3000, () => {
  console.log("Pia server running on http://localhost:3000");
  process.send?.("READY");
});
