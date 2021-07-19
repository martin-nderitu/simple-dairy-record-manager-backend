import {Request, Response, NextFunction} from "express";

function checkIfLoggedIn(req: Request, res: Response, next: NextFunction) {
    if (req.session.user) {
        if (req.session.user.active) {
            return res.status(200).json({ user: req.session.user });
        } else {
            return res.status(400).json({
                error: "Your account is inactive. Please contact the system administrator for more information"
            });
        }
    } else { next(); }
}

function checkRole(req: Request, res: Response, next: NextFunction, role: "admin" | "farmer" | "milk collector") {
    if (req.session.user) {
        if (req.session.user.role === role) {
            if (req.session.user.active) { next(); }
            else {
                return res.status(400).json({
                    error: "Your account is inactive. Please contact the system administrator for more information"
                });
            }
        } else {
            return res.status(400).json({
                error: "Access denied. You are not authorized to view this resource"
            });
        }
    } else {
        return res.status(400).json({
            error: "You are not logged in. Please login to continue"
        });
    }
}

const isAdmin = (req: Request, res: Response, next: NextFunction) =>
    checkRole(req, res, next, "admin");

const isFarmer = (req: Request, res: Response, next: NextFunction) =>
    checkRole(req, res, next, "farmer");


const isMilkCollector = (req: Request, res: Response, next: NextFunction) => {
    checkRole(req, res, next, "milk collector");}

export {
    checkIfLoggedIn,
    isAdmin, isFarmer, isMilkCollector
}
