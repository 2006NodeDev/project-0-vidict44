// this is going to be a representation of the book data we get from the database
// not what we send to the user, this is the database version
export class ReimbursementDTO {
    reimbursementId: number
    author: number
    amount:number
    dateSubmitted: number
    dateResolved: number
    description: string
    resolver: number
    status: number
    type: number
}