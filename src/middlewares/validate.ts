import { validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { default as DBG } from "debug";

const debug = DBG("sdrm-validation-error:debug");

export function validate(req: Request, res: Response, next: NextFunction) {
    try {
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            next();
        } else {
            const errs = errors.array();
            const invalidData: { [key: string]: string } = {};

            for (const err of errs) {
                if (err.nestedErrors) {
                    const errors = [];
                    for (const nestedErr of err.nestedErrors) {
                        // @ts-ignore
                        invalidData[nestedErr.param] = nestedErr.msg;
                        errors.push({...invalidData});
                    }
                }
                else {
                    invalidData[err.param] = err.msg;
                }
            }

            return res.status(400).json({
                invalidData
            });
        }
    } catch (errors) {
        debug("\n\nErrors in validation middleware = ", errors, "\n\n")
    }
}

