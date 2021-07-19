import { default as express } from "express";
import * as recordController from "../controllers/milkRecord.js";
import { validate } from "../../middlewares/validate.js";
import {isMilkCollector} from "../../middlewares/auth.js";
import { isMilkCollectorRecord } from "../../middlewares/isMilkCollectorRecord.js";
import { recordRules, rateRules, rateFilter } from "../../middlewares/validators/index.js";
import filter from "../../middlewares/filter.js";
import * as rateController from "../controllers/rate.js";


export const router = express.Router();

router.route("/records/:id")
    .get(isMilkCollector, isMilkCollectorRecord, recordRules.read, validate, recordController.read)
    .delete(isMilkCollector, isMilkCollectorRecord, recordRules.destroy, validate, recordController.destroy);

router.route("/records")
    .get(isMilkCollector, recordRules.filter, validate, filter.milkCollectorRecord, recordController.records)
    .put(isMilkCollector, isMilkCollectorRecord, recordRules.update, validate, recordController.update)
    .post(isMilkCollector, recordRules.create, validate, recordController.create);

router.route("/rates/:id")
    .get(isMilkCollector, rateRules.read, validate, rateController.read);

router.route("/rates")
    .get(isMilkCollector, rateFilter, validate, filter.rate, rateController.rates);
