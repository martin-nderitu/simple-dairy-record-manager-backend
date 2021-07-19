import { default as express } from "express";
import * as recordController from "../controllers/milkRecord.js";
import * as rateController from "../controllers/rate.js";
import { validate } from "../../middlewares/validate.js";
import { isFarmer } from "../../middlewares/auth.js";
import { recordRules, recordFilter, rateRules, rateFilter } from "../../middlewares/validators/index.js";
import filter from "../../middlewares/filter.js";
import {isFarmerRecord} from "../../middlewares/isFarmerRecord.js";


export const router = express.Router();

router.route("/records/:id")
    .get(isFarmer, isFarmerRecord, recordRules.read, validate, recordController.read);

router.route("/records")
    .get(isFarmer, recordFilter, validate, filter.farmerRecord, recordController.records);

router.route("/rates/:id")
    .get(isFarmer, rateRules.read, validate, rateController.read);

router.route("/rates")
    .get(isFarmer, rateFilter, validate, filter.rate, rateController.rates);
