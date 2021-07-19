import {param} from "express-validator";
import isNumeric from "../../../utils/isNumeric.js";

export const destroy = (name: string, callback: { (pk: number): any }, fields: string | string[] = "id") => {
    return param(fields)
        .trim().escape().notEmpty().withMessage(`${name} id(s) is/are required`)
        .bail().customSanitizer( value => value.split(","))
        .custom(async value => {
            for (const id of value) {
                if (isNumeric(id)) {
                    const response = await callback(parseInt(id));
                    if (response === null) {
                        return Promise.reject(`${name} with id '${id}' does not exist`);
                    }
                } else {
                    throw new Error(`Non-numeric ${name} id '${id}' found`);
                }
            }
            return true;
        })
        .customSanitizer((value: string[]) => value.map(id => parseInt(id)));
}