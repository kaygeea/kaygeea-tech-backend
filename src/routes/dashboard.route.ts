import { Router } from "express";
import profileRouter from "./profile.route.js";

const dashboardRouter: Router = Router();

dashboardRouter.use("/profile", profileRouter);

export default dashboardRouter;
