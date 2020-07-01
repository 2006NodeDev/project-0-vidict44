import { HttpError } from "./HttpError";

//a specific impl of HTTPError
export class ReimbursementUserInputError extends HttpError {
    constructor(){//has no params
        super(400, 'Please Fill Out All Reimbursement Fields')
    }
}