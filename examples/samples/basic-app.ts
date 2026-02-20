import { Piax } from "piax";

const app = new Piax();

/// hello world
app.get("/", (ctx) => "Hello Piax");

/// serve
app.serve(2332, () => {
  console.log(`🚀 Server running on http://localhost:2332`);
});
