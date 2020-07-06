import express, { Request, Response, NextFunction } from 'express'
import {getAllReimbursements, findreimbursementById, saveOneReimbursement, updateReimbursementInfo } from '../daos/reimbursement-dao'
import { ReimbursementInputError } from '../errors/ReimbursementInputError'
import { ReimbursementUserInputError } from '../errors/ReimbursementUserInputError'
import { Reimbursement } from '../models/Reimbursement'
import { authorizationMiddleware } from '../middleware/authorization-middleware'

// is like a sub division of the application itself
export let reimbursementRouter = express.Router()
// the router already has the path /books so we assume that every endpoint inside of the router already match /books

reimbursementRouter.get('/status/:statusId', authorizationMiddleware(['Admin', 'Manager', 'User']),async (req: Request, res: Response, next: NextFunction) => {
    // .json sends the objects in Json notation
    let {statusId} = req.params
    if(req.session.user.role.role === "User"){
        res.status(401).send("You dont have permission for this")
    } 
    try {
        let reimbursement = await getAllReimbursements(+statusId)
        res.json(reimbursement)
    } catch (e) {
        next(e)
    }


})


// this endpoint will run all the middleware functions one at a time
reimbursementRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);//lets look at what the request body looks like
    let  { 
        author,
        amount,
        dateSubmitted,
        dateResolved,
        description,
        resolver,
        status,
        type
        } = req.body;//this is destructuring
        
    // warning if data is allowed to be null or 0, or false, this check is not sufficient
    if (author && amount && dateSubmitted && dateResolved && description && resolver && status && type) {
        
        let savedreimbursement: Reimbursement={
            reimbursementId: 0,
            author,
            amount,
            dateSubmitted,
            dateResolved,
            description,
            resolver,
            status,
            type
        } 
        
        try{
            let newReim = await saveOneReimbursement(savedreimbursement)
            res.json(newReim)
             res.sendStatus(201)//201 is created
        } catch(e){
            next(e)
        }
        
    } else {
        // .status sets the status code but deson't send res
        // .send can send a response in many different content-types
        throw new ReimbursementUserInputError()
    }
})

//express supports path params natively by putting : in the path
// express takes the value in the : and puts it on the request object
reimbursementRouter.get('/author/userId/:id',authorizationMiddleware(['Admin','Manager', 'User']), async (req: Request, res: Response, next:NextFunction) => {
    let { id } = req.params// destructring
    if (isNaN(+id)) {// we can use the + to convert a variable to a number - node says do it this way
        next(new ReimbursementInputError())//we didn't get a number in the path
    } else if(req.session.user.role.role === "User"  && req.session.user.userId !== +id){
        res.status(401).send("You dont have permission for this")
    } else{
        try {
            let reimbursement = await findreimbursementById(+id)
            res.json(reimbursement)
        } catch(e){
            next(e)
        }
    }
}
)

reimbursementRouter.patch('/', authorizationMiddleware(['Admin', 'Manager']), async (req:Request, res:Response, next:NextFunction) => {
    let { reimbursementId,
        author,
        amount,
        dateSubmitted,
        dateResolved,
        description,
        resolver,
        status,
        type} = req.body
    if(!reimbursementId) { //update request must contain a reimbursementId
        res.status(400).send('Reimbursement Updates Require ReimbursementId and at Least One Other Field')
    }
    if(isNaN(+reimbursementId)) { //check if reimbursementId is valid
        res.status(400).send('Id Needs to be a Number')
    }
    if  (status === "Approved" || status === "Denied")
    {

        let updatedReimInfo:Reimbursement = { 
            reimbursementId, 
            author,
            amount,
            dateSubmitted,
            dateResolved,
            description,
            resolver,
            status,
            type
        }
        updatedReimInfo.author = author || undefined
        updatedReimInfo.amount = amount || undefined
        updatedReimInfo.dateSubmitted = dateSubmitted || undefined
        updatedReimInfo.dateResolved = dateResolved || undefined
        updatedReimInfo.description = description || undefined
        updatedReimInfo.resolver = resolver || undefined
        updatedReimInfo.status = status || undefined
        updatedReimInfo.type = type || undefined
        try {
            let results = await updateReimbursementInfo(updatedReimInfo)
            res.json(results)
        } catch (e) {
            next(e)
        }
    } else {
        let updatedReimInfo: Reimbursement =
        {

        reimbursementId,
            author,
            amount,
            dateSubmitted: undefined,
            dateResolved: null,
            description,
            resolver: null,
            status:3,
            type
        }
        updatedReimInfo.author = author || undefined
        updatedReimInfo.amount = amount || undefined
        updatedReimInfo.description = description || undefined      
        updatedReimInfo.status = status || undefined
        updatedReimInfo.type = type || undefined

        try {
            let updatedReimbursementResults = await updateReimbursementInfo(updatedReimInfo)
            res.json(updatedReimbursementResults)
        } catch (e) {
            next(e)
        }
    }
})