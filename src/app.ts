import cors from "cors";
import express from "express";

import { errorMiddleware } from "./middleware/error.middleware.js";
import { notFoundMiddleware } from "./middleware/not-found.middleware.js";
import { requestLoggerMiddleware } from "./middleware/request-logger.middleware.js";
import { router } from "./routes/index.js";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLoggerMiddleware);
app.use(router);
app.use(notFoundMiddleware);
app.use(errorMiddleware);
