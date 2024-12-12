import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Express } from "express";
import morgan from "morgan";
import { globalErrorHandler } from "./controllers/error.controller.js";
import viewRouter from "./routes/view.route.js";
import dashboardRouter from "./routes/dashboard.route.js";

const app: Express = express();

app.use(compression());
app.use(cookieParser());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/", viewRouter);
app.use("/dashboard", dashboardRouter);
app.use(globalErrorHandler);

export default app;
