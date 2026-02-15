import { Pia } from "../src/index";

export const createTestApp = () => {
  const app = new Pia();
  ///
  app.get("/", (ctx) => {
    ctx.text("Hello Pia");
  });
  /// JSON endpoint
  app.get("/users", (ctx) => {
    ctx.json([
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
    ]);
  });
  /// POST endpoint
  app.post("/users", (ctx) => {
    const user = ctx.body as { name: string; email: string };
    ctx.json({ id: Date.now(), ...user }, 201);
  });
  /// Query param
  app.get("/search", (ctx) => {
    const query = ctx.query.q;
    ctx.json({ query, results: [] });
  });
  /// Param
  app.get("/users/:id", (ctx) => {
    const id = (ctx.params as { id: string }).id;
    ctx.json({ id, name: `User ${id}` });
  });

  return app;
};
