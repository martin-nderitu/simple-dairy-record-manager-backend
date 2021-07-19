import { default as express } from "express";
import * as accountsController from "../controllers/accounts.js";
import { validate } from "../../middlewares/validate.js";
import { accountRules } from "../../middlewares/validators/index.js";
import {checkIfLoggedIn} from "../../middlewares/auth.js";

export const router = express.Router();

router.route("/register")
    .post(accountRules.register, validate, accountsController.register);

router.route("/login")
    .post(checkIfLoggedIn, accountRules.login, validate, accountsController.login);

router.route("/check/logged-in")
    .get(accountsController.isLoggedIn);

router.route("/logout")
    .get(accountsController.logout)