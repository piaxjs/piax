import { H3, serve } from "h3";

const app = new H3();
app.get("/", () => {
  return { message: "Hello H3" };
});

app.get("/api/users", (e) => {
  return [{ id: 1, name: "John" }];
});

app.get("/api/users/:id", (e) => {
  const id = e.context.params?.id;
  return { id, name: "John" };
});

app.post("/api/users", async (e) => {
  const body = await e.req.json();
  return { id: 123, ...body };
});

async function start() {
  try {
    const server = serve(app, { port: 3000 });
    await server.ready();
    console.log("H3 ready on port 3000");
    process.send?.("READY");
    process.on("SIGTERM", () => {});
  } catch (error) {
    console.error("Failed to start H3 server", error);
    process.exit(1);
  }
}

start();
