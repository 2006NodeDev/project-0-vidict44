import { ReimbursementDTO } from "../dtos/reimbursement-dto";
import { Reimbursement } from "../models/Reimbursement";

// works perfectly with the map function
export function ReimbursementDTOtoReiumbursementConvertor( rto:ReimbursementDTO):Reimbursement{
    
    return {
        reimbursementId: rto.reimbursementId,
        author: rto.author,
        amount: rto.amount,
        dateSubmitted: rto.dateSubmitted,
        dateResolved: rto.dateResolved,
        description: rto.description,
        resolver: rto.resolver,
        status: rto.status,
        type: rto.type
    }
}