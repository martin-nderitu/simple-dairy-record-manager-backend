import { default as express } from "express";
import * as rateController from "../../controllers/rate.js";
import {rateRules} from "../../../middlewares/validators/index.js";
import filter from "../../../middlewares/filter.js"
import {validate} from "../../../middlewares/validate.js";
import {isAdmin} from "../../../middlewares/auth.js";

export const router = express.Router();

router.route("/:id")
    .get(isAdmin, rateRules.read, validate, rateController.read)
    .delete(isAdmin, rateRules.destroy, validate, rateController.destroy);

router.route("/")
    .get(isAdmin, rateRules.filter, validate, filter.rate, rateController.rates)
    .put(isAdmin, rateRules.update, validate, rateController.update)
    .post(isAdmin, rateRules.create, validate, rateController.create);


