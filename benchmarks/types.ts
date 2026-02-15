export interface BenchConfig {
  duration: number;
  connections: number;
  pipelining: number;
  warmupDuration: number;
  workers: number;
  //
  apps?: string[];
  endpoint?: string;
}

export interface BenchSummary {
  app: string;
  reqAvg: number;
  latencyAvg: number;
  throughputAvg: number;
  errors: number;
}

export type BenchPreset = "quick" | "standard" | "production" | "stress";

export const BENCH_PRESETS: Record<BenchPreset, BenchConfig> = {
  quick: {
    duration: 10,
    connections: 50,
    pipelining: 1,
    workers: 1,
    warmupDuration: 3,
  },
  standard: {
    duration: 20,
    connections: 100,
    pipelining: 1,
    workers: 1,
    warmupDuration: 5,
  },
  production: {
    duration: 30,
    connections: 500,
    pipelining: 10,
    workers: 4,
    warmupDuration: 10,
  },
  stress: {
    duration: 60,
    connections: 1000,
    pipelining: 10,
    workers: 8,
    warmupDuration: 15,
  },
};
