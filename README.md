# Piax

A modern, type-safe HTTP framework for Node.js

⚠️ This project is under heavy development.
Not ready for production use.

**Basic Usage**
```ts
import { Piax } from "piax";

const app = new Piax();

app.get("/", () => "Hello Piax!");
```

**Basic Routing**
```ts
app.get("/user/:id", ( ctx ) => {
  const { id } = ctx.params; // ✅ type-safe
  return { id: Number(id) };
});

app.post("/post/:pid", ({ params, body }) => {
  const { pid } = params;
  const data = body; // ✅ parsed & type-safe
  return { pid, data };
});

```

## 📄 License

MIT License