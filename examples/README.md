# Piax Examples

This directory contains example applications for **Piax**.

It is used during development to experiment with features and test real-world usage patterns.

> This is not production code.

## Usage

Inside the `examples` directory:

```bash
pnpm dev
```
Runs the default sample: ``samples/basic-app``

**Run a specific sample:**
```bash
pnpm dev --sample basic-app
# or
pnpm dev -s basic-app
```

## Running Without the CLI

Samples can also be executed directly using tsx:
```bash
tsx samples/basic-app.ts
# or
tsx samples/another/index.ts
```
The CLI simply exists to make this process easier and more convenient.

## Structure
```bash
examples/
├─ index.ts
└─ samples/
   ├─ basic-app.ts
   └─ another/
      └─ index.ts
```

## Notes
- Uses tsx to run TypeScript files
- Supports .ts and .js samples
- Throws an error if the sample is not found