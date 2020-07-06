// different users have different roles
// different roles allow you to do different things
// different endpoints require different roles
//before I allow someone to access an endpoint, I want to make sure they have a role that matches that endpoints allowed roles

import { Request, Response, NextFunction, response } from "express";

// utilize the factory pattern, we provide an array of accepted roles, and return a function that allows those roles through
// this function is a middleware factory
export function authorizationMiddleware(roles:string[]){// build a middleware function
    return (req:Request, res:Response, next:NextFunction) => {
        let allowed = false
        if(req.session.user){
        for(const role of roles){
            if(role === req.session.user.role.role){
                //we found a matching role, allow them in
                allowed = true
                next()
            }
        
        if(!allowed){
            // if they didn't have a matching role kick em out
            res.status(401).send('The incoming token has expired')
        }
    }
}else{
    response.status(401).send("The incoming token has expired");
}

}

}

