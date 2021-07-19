import { default as express } from "express";
import * as userController from "../../controllers/user.js";
import {userRules} from "../../../middlewares/validators/index.js";
import filter from "../../../middlewares/filter.js"
import {validate} from "../../../middlewares/validate.js";
import {isAdmin} from "../../../middlewares/auth.js";

export const router = express.Router();

router.route("/:id")
    .get(isAdmin, userRules.read, validate, userController.read)
    .delete(isAdmin, userRules.destroy, validate, userController.destroy);

router.route("/")
    .get(isAdmin, userRules.filter, validate, filter.user, userController.users)
    .put(isAdmin, userRules.update, validate, userController.update)
    .post(isAdmin, userRules.create, validate, userController.create);


