# Piax

A modern, type-safe HTTP framework for Node.js, built with TypeScript.

> ⚠️ API is unstable and may change. Not recommended for production use.


## Quick Start

### Create a new project

```bash
# using npm
npm create piax@latest

# or using pnpm
pnpm create piax@latest

# or via yarn
yarn create piax
```

### Install & run

```bash
cd <app name>
npm install
npm run dev
```

## Examples

### Basic App

```ts
import { Piax } from 'piax'

const app = new Piax()

app.get('/', () => 'Hello Piax!')

app.listen(2323)
```
### Basic Routing

```ts
import { Piax } from 'piax'

const app = new Piax()

// Route params (type-safe)
app.get('/user/:id', (ctx) => {
  return { id: ctx.params.id } // ✅ parsed & type-safe
})

// Query params
app.get('/search', (ctx) => {
  return { query: ctx.query.q }
})

// POST with body
app.post('/posts', (ctx) => {
  return { data: ctx.body }
})

app.listen(2323)
```

## Documentation

- [Core Package](./packages/core/README.md)
- [Examples](./examples)
- [Benchmarks](./benchmarks)


## Development

```bash
# Install
pnpm install

# Dev mode
pnpm dev

# Start an example
pnpm sample -s basic-app

# Run tests
pnpm test

# Run benchmarks
pnpm bench
# or
pnpm bench:piax

# Build all packages
pnpm build
```

## 📄 License

MIT License