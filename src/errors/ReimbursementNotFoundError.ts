import { HttpError } from "./HttpError";

export class ReimbursementNotFoundError extends HttpError{
    constructor(){
        super(404, 'That Reimbursement Does Not Exist')
    }
}