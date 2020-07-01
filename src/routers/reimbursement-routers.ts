import express, { Request, Response, NextFunction } from 'express'
import {getAllReimbursements, findreimbursementById, saveOneReimbursement } from '../daos/reimbursement-dao'
import { ReimbursementInputError } from '../errors/ReimbursementInputError'
import { ReimbursementUserInputError } from '../errors/ReimbursementUserInputError'
import { Reimbursement } from '../models/Reimbursement'

// is like a sub division of the application itself
export let reimbursementRouter = express.Router()
// the router already has the path /books so we assume that every endpoint inside of the router already match /books

reimbursementRouter.get('/status/:statusId', async (req: Request, res: Response, next: NextFunction) => {
    // .json sends the objects in Json notation
    let {statusId} = req.params
    try {
        let reimbursement = await getAllReimbursements(+statusId)
        res.json(reimbursement)
    } catch (e) {
        next(e)
    }


})

// for saving a new book
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
        //books.push({ bookId, genre, authors, publisher, publishingDate, pages, chapters, title, series, numberInSeries, ISBN })
        //sendStatus just sents an empty response with the status code provided
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
reimbursementRouter.get('/:id', async (req: Request, res: Response, next:NextFunction) => {
    let { id } = req.params// destructring
    //goal is to return a specific book that matches the id we got
    // the id could be bad - string instead of a number -- BookIdInputError
    // the id could not exist -- BookNotFound
    if (isNaN(+id)) {// we can use the + to convert a variable to a number - node says do it this way
        next(new ReimbursementInputError())//we didn't get a number in the path
    } else {
        try {
            let reimbursement = await findreimbursementById(+id)
            res.json(reimbursement)
        } catch(e){
            next(e)
        }
    }
})

