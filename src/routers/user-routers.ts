import express, { Request, Response, NextFunction } from 'express'
import { authenticationMiddleware } from '../middleware/authentication-middleware'
import { getAllUsers, getUserById, saveOneUser, patchUser} from '../daos/user-dao'
import { authorizationMiddleware } from '../middleware/authorization-middleware'
import { UserUserInputError } from '../errors/UserUserInputError'
import { User } from '../models/User'
//import { Role } from '../models/Role'
// our base path is /users
export const userRouter = express.Router()

// this applies this middleware to the entire router beneath it
userRouter.use(authenticationMiddleware)



// Get all
userRouter.get('/', authorizationMiddleware(['Admin', 'Manager']), async (req: Request, res: Response, next: NextFunction) => {
 
    try {
        //lets try not being async and see what happens
        let allUsers = await getAllUsers()//thinking in abstraction
        res.json(allUsers)
    } catch (e) {
        next(e)
    }
})

// userRouter.post('/:id', async (req: Request, res: Response, next: NextFunction) => {
//     let { id } = req.params
//     if (isNaN(+id)) {
//         // send a response telling them they need to give us a number
//         res.status(400).send('Id needs to be a number')// the error way is better because it scales easier, fewer places you have to change code if you want to refactor
//     } else {
//         try {
//             let user = await getUserById(+id)
//             res.json(user)
//         } catch (e) {
//             next(e)
//         }
//     }
// })


//get by id
userRouter.get('/:id', authorizationMiddleware(['Admin', 'Manager', 'User']), async (req: Request, res: Response, next: NextFunction) => {
    let { id } = req.params
    if (isNaN(+id)) {
        // send a response telling them they need to give us a number
        res.status(400).send('Id needs to be a number')// the error way is better because it scales easier, fewer places you have to change code if you want to refactor
    } 
         else if(req.session.user.role.role === "User" && req.session.user.userId !== +id){
           throw new Error("You dont have permission for this");
    }else{
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
    if (!username || !password ) {
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
    
        
        
        newUser.username = username || null
        newUser.password = password || null
        newUser.email = email || null
        newUser.firstName = firstName || null
        newUser.lastName = lastName || null
        newUser.role = role || null
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
// userRouter.patch('/', async(req:Request, res:Response, next:NextFunction) =>{
//     //let { id } = req.params;
//     let { userid, username, userpassword, firstname, lastname, email, Role } = req.body //destructuring
//     if ((username || userpassword || firstname || lastname || email || Role)&& userid){
//         if (isNaN(+userid)) {
//             next(new UserUserInputError());
//         }
//         let partialUser:User = { 
//             userId: +userid, 
//             username:(username?username:""), 
//             password:(userpassword?userpassword:""), 
//             firstName:(firstname?firstname:""), 
//             lastName:(lastname?lastname:""), 
//             email:(email?email:""), 
//             role:(Role.roleId?roleid:0) 
//         }
//         try { 
//             let user = await updateUserById(partialUser);
//             res.json(user);
//         } catch (e) {
//             next(e);
//         }
//     } else {
//         next(new UserUserInputError); 
//     }
// });

// // })

userRouter.patch('/', authorizationMiddleware(['Admin']), async (req:Request, res:Response, next:NextFunction) =>
{
    let { userId,
        username,
        password,
        firstName,
        lastName,
        email,
        role } = req.body
        if(!userId) 
        { 
            res.status(400).send('Please enter userId and update a field')
        }
        else if(isNaN(+userId)) { 
            res.status(400).send('Id needs to be a number')
        }
        else {
            let updatedUser:User = {
                userId,
                username,
                password,
                firstName,
                lastName,
                email,
                role
            }
            updatedUser.username = username || undefined
            updatedUser.password = password || undefined
            updatedUser.firstName = firstName || undefined
            updatedUser.lastName = lastName || undefined
            updatedUser.email = email || undefined
            updatedUser.role = role || undefined
            try {
                let result = await patchUser(updatedUser)
                res.json(result)
            } catch (e) {
                next(e)
            }
        }
    }) 
// delete user


