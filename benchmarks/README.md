# Piax Benchmarks

This directory contains performance benchmarks for the framework.

The benchmark runner supports multiple presets and allows testing
specific frameworks via CLI flags.

> These benchmarks are internal performance measurements and are not part of the public API.

---

## Requirements

- ``Node.js v20+``
- ``pnpm``

---

## Running Benchmarks

### Default (``standard`` preset)

```bash
pnpm bench
```

---

### Using a preset

```bash
pnpm bench --preset quick
pnpm bench --preset production
pnpm bench --preset stress
```

**Available presets:**

- ``quick``
- ``standard``
- ``production``
- ``stress``

---

### Testing Specific Frameworks

You can limit which frameworks are tested using the `--apps` flag.

**Examples:**
```bash
pnpm bench --apps piax
pnpm bench --apps piax koa fastify
```

This runs benchmarks only for the specified applications.

---

### Custom Endpoint
```bash
pnpm bench --endpoint /users
```

---

## Preset Configuration

Presets control the benchmark intensity.

| Preset     | Duration | Connections | Pipelining | Workers | Warmup |
| ---------- | -------- | ----------- | ---------- | ------- | ------ |
| quick      | 10s      | 50          | 1          | 1       | 3s     |
| standard   | 20s      | 100         | 1          | 1       | 5s     |
| production | 30s      | 500         | 10         | 4       | 10s    |
| stress     | 60s      | 1000        | 10         | 8       | 15s    |

---

## CLI Options

| Opt               | Desc                           |
| ----------------- | ------------------------------ |
| --preset <name>   | Benchmark preset               |
| --apps <list>     | Comma-separated framework list |
| --endpoint <path> | Endpoint to benchmark          |

**Example:**
```bash
pnpm bench --preset production --apps piax fastify --endpoint /json
```


## Notes

- Benchmarks are CPU and machine dependent.
- Always compare results on the same hardware.
- Warmup phase is excluded from final metrics.
- Results include:
  - Average requests/sec
  - Average latency
  - Throughput
  - Error count

---

## Benchmark Philosophy

These benchmarks aim to measure:

- Router overhead
- Request handling throughput
- Latency under concurrency
- Scaling behavior under load

They are not intended to represent real-world production traffic.

For production performance evaluation, use realistic traffic simulation.



