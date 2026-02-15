// apps/koa.ts
import Koa, { type Context } from "koa";
import Router from "@koa/router";
import { koaBody } from "koa-body";

const app = new Koa();
const router = new Router();
///
app.use(async (ctx: Context, next) => {
  try {
    await next();
  } catch (err: any) {
    ctx.status = err.status || 500;
    ctx.body = { error: err.message };
  }
});
// Body parser
app.use(koaBody({ json: true, multipart: false, urlencoded: false }));
// Routes
router.get("/", (ctx: Context) => {
  ctx.body = { message: "Hello Koa" };
});

router.get("/api/users", (ctx: Context) => {
  ctx.body = [{ id: 1, name: "John" }];
});

router.get("/api/users/:id", (ctx: Context) => {
  const { id } = ctx.params as { id: string };
  ctx.body = { id, name: "John" };
});

router.post("/api/users", (ctx: Context) => {
  const body = ctx.request.body as Record<string, any>;
  ctx.body = { id: 123, ...body };
});

app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(3000, () => {
  console.log("Koa server running on http://localhost:3000");
  process.send?.("READY");
});

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
