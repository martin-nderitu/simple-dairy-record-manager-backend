import { default as express } from "express";
import * as recordController from "../../controllers/milkRecord.js";
import {recordRules} from "../../../middlewares/validators/index.js";
import filter from "../../../middlewares/filter.js"
import {validate} from "../../../middlewares/validate.js";
import {isAdmin} from "../../../middlewares/auth.js";

export const router = express.Router();

router.route("/:id")
    .get(isAdmin, recordRules.read, validate, recordController.read)
    .delete(isAdmin, recordRules.destroy, validate, recordController.destroy);

router.route("/")
    .get(isAdmin, recordRules.filter, validate, filter.record, recordController.records)
    .put(isAdmin, recordRules.update, validate, recordController.update)
    .post(isAdmin, recordRules.create, validate, recordController.create);


