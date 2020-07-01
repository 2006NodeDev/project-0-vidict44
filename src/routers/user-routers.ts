import express, { Request, Response, NextFunction } from 'express'
import { authenticationMiddleware } from '../middleware/authentication-middleware'
import { getAllUsers, getUserById, saveOneUser } from '../daos/user-dao'
import { authorizationMiddleware } from '../middleware/authorization-middleware'
import { UserUserInputError } from '../errors/UserUserInputError'
import { User } from '../models/User'
// our base path is /users
export const userRouter = express.Router()

// this applies this middleware to the entire router beneath it
userRouter.use(authenticationMiddleware)


// Get all
userRouter.get('/', authorizationMiddleware(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
 
    try {
        //lets try not being async and see what happens
        let allUsers = await getAllUsers()//thinking in abstraction
        res.json(allUsers)
    } catch (e) {
        next(e)
    }
})


//get by id
userRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.params
    if (isNaN(+id)) {
        // send a response telling them they need to give us a number
        res.status(400).send('Id needs to be a number')// the error way is better because it scales easier, fewer places you have to change code if you want to refactor
    } else {
        try {
            let user = await getUserById(+id)
            res.json(user)
        } catch (e) {
            next(e)
        }
    }
})

//save new
userRouter.post('/', authorizationMiddleware(['Admin']), async (req: Request, res: Response, next: NextFunction) => {
    // get input from the user
    let { userId, username, password, email, firstName, lastName, role } = req.body//a little old fashioned destructuring
    //verify that input
    if (!username || !password || !role) {
        next(new UserUserInputError)
    } else {
        //try  with a function call to the dao layer to try and save the user
        let newUser: User = {
            userId,
            username,
            password,
            email,
            firstName,
            lastName,
            role
        }
    
        
        newUser.email = email || null
        try {
            let savedUser = await saveOneUser(newUser)
            res.json(savedUser)// needs to have the updated userId
        } catch (e) {
            next(e)
        }
    }




    //catch with next(e)


})




//patch user

//delete user


