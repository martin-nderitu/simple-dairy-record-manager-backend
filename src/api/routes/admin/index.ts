import { default as express } from "express";
import { router as userRoutes } from "./user.js";
import { router as rateRoutes } from "./rate.js";
import { router as milkRecordRoutes } from "./milkRecord.js";

export const router = express.Router();

router.use("/users", userRoutes);
router.use("/rates", rateRoutes);
router.use("/records", milkRecordRoutes);
