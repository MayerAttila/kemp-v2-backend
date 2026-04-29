import type { RequestHandler } from "express";

const colors = {
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  reset: "\x1b[0m",
} as const;

const getLogLevel = (statusCode: number) => {
  if (statusCode >= 500) {
    return "error";
  }

  if (statusCode >= 400) {
    return "warn";
  }

  return "log";
};

const getStatusColor = (statusCode: number) => {
  if (statusCode >= 500) {
    return colors.red;
  }

  if (statusCode >= 400) {
    return colors.yellow;
  }

  return colors.green;
};

export const requestLoggerMiddleware: RequestHandler = (req, res, next) => {
  const startedAt = performance.now();

  res.on("finish", () => {
    const durationMs = Math.round(performance.now() - startedAt);
    const level = getLogLevel(res.statusCode);
    const statusColor = getStatusColor(res.statusCode);
    const timestamp = new Date().toISOString();

    console[level](
      `${statusColor}[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs}ms${colors.reset}`,
    );
  });

  next();
};
