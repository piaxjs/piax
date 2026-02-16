import { Piax } from "piax";

const app = new Piax();

/// hello world
app.get("/", (ctx) => "Hello World");

/// params
app.get("/user/:uid", (ctx) => {
  const { uid } = ctx.params;
  ctx.json({ uid });
});

/// serve
app.serve(2332, () => {
  console.log(`🚀 Server running on http://localhost:2332`);
});
