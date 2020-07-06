import { HttpError } from './HttpError'

export class UserIdInputError extends HttpError{
    constructor(){
        super(400, "Id must be a number")
    }
}