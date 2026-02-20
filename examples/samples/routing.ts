import { Piax } from "piax";
import type { Context } from "piax";

const app = new Piax();

app.get("/", () => "Hello World");

app.get("/user/:uid", (ctx) => {
  const { uid } = ctx.params;
  ctx.json({ uid });
});

app.serve(2332);
