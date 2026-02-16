# Piax

A modern, type-safe HTTP framework for Node.js, built with TypeScript.

⚠️ This project is under heavy development.  
Not ready for production use.

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
cd <my-app>
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

## Context

The ctx object provides request/response utilities:

#### Properties

- `ctx.method` - HTTP method (GET, POST, etc.)
- `ctx.path` - Request path
- `ctx.url` - Full request URL
- `ctx.params` - Route parameters (type-safe)
- `ctx.query` - Query string parameters
- `ctx.headers` - Request headers
- `ctx.body` - Request body (parsed)
- `ctx.status` - Response status code

#### Methods

- `ctx.json(data)` - Send response json
- `ctx.text(text)` - Send response text


## Links

- [GitHub Repository](https://github.com/piaxjs/piax)
- [Issue Tracker](https://github.com/piaxjs/piax/issues)
- [NPM Package](https://www.npmjs.com/package/piax)


## 📄 License

MIT License