import { Router } from "express";
import userProfileRouter from "./user-profile.route.js";

const dashboardRouter: Router = Router();

dashboardRouter.use("/profile", userProfileRouter);

export default dashboardRouter;
