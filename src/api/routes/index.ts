import { default as express } from "express";
import { router as adminRoutes } from "./admin/index.js";
import { router as accountRoutes } from "./accounts.js";
import { router as farmerRoutes } from "./farmer.js";
import { router as milkCollectorRoutes } from "./milkCollector.js";

export const router = express.Router();

router.use("/admin", adminRoutes);
router.use("/accounts", accountRoutes);
router.use("/farmers", farmerRoutes);
router.use("/milk-collectors", milkCollectorRoutes);

