// this is going to contain all the functions that interact wit hthe book table

import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";

import { ReimbursementNotFoundError } from "../errors/ReimbursementNotFoundError";


import { ReimbursementDTOtoReiumbursementConvertor } from "../utils/reimbursementDTO-reimbursement-converter";
import { Reimbursement } from "../models/Reimbursement";
import { ReimbursementInputError } from "../errors/ReimbursementInputError";
/*
    takes in no inputs 
    output of every book from the database
    data should be output in the form of a Book[]
*/
//if we swap to different database like oracle, or maybe even a nosql database
//so long as this function continues to return all of the books
//we don't have to chnage any other code in the program
export async function getAllReimbursements(statusId: number) {
    let client: PoolClient;// this will be the "connection" we borrow from the pool but 
    //that process can take some time and can fail so we declare the var ahead of time
    try {
        client = await connectionPool.connect()
        let results: QueryResult = await client.query(`select r."reimbursementId", r."author", r."amount", r."dateSubmitted" ,r."dateResolved" , r."description" , r."resolver" , r."status" , r."type" 
                                                    from project0."reimbursement" r 
                                                     join project0."reimbursementStatus" rs on r."status" = rs."statusId"
                                                     join project0."reimbursementType" rt  on r."type" = rt."typeId"
                                                     where r."status" = ${statusId};`)
        return results.rows.map(ReimbursementDTOtoReiumbursementConvertor)
    } catch (e) {
        //we should do some sort of error processing in this catch statement
        console.log(e)
        throw new Error('un-implemented error handling')
    } finally {
        // we make sure client isn't undefined
        client && client.release()//then we release it
    }
}

export async function findreimbursementById(id:number) {
    let client: PoolClient;
    try{
        //id = '1 or 1 = 1; drop table lightlyburning.books cascade; select * from lightlyburning.book '
        client = await connectionPool.connect()
        let results: QueryResult = await client.query(`select r."reimbursementId", r."author", r."amount", r."dateSubmitted" ,r."dateResolved" , r."description" , r."resolver" , r."status" , r."type"  
        from project0.reimbursement r 
            join project0.reimbursementStatus rs on r."status" = rs."statusId"
            join project0.reimbursementType rt  on r."type" = rt."typeId"
        where r."author" = ${id}
        group by r."reimbursementId";`)//directly inputting user values is very dangerous
        //sql injction which is very bad, we will learn how to fix with a parameterized query
        if(results.rowCount === 0){
            throw new Error('NotFound')
        }else{
            return ReimbursementDTOtoReiumbursementConvertor(results.rows[0])
        }
    }catch(e){
        //some real error handling
        if(e.message === 'NotFound'){
            throw new ReimbursementNotFoundError()
        }
        console.log(e)
        throw new Error('un-implemented error handling')
    }finally{
        client && client.release()
    }
}


export async function saveOneReimbursement(newReimbursement:Reimbursement):Promise<Reimbursement>{
    let client:PoolClient
    try{
        client = await connectionPool.connect()
        //if you have multiple querys, you should make a transaction
        await client.query('BEGIN;')//start a transaction
        //let statusId = await client.query(`select rs."statusId" from project0."reimbursementStatus" rs where rs."status" = $1`, [newReimbursement.status])
        let typeId = await client.query(`select rt."typeId" from project0."reimbursementType" rt where rt."typeId" = $1`, [newReimbursement.type])
        if( typeId.rowCount === 0 ){
            throw new Error('Type not found')
        }
        //statusId = statusId.rows[0]."statusId"
        typeId = typeId.rows[0].typeId
        let results = await client.query(`insert into project0."reimbursement" ("author", "amount","dateSubmitted", "dateResolved", "description","resolver", "status", "type")
                                            values($1,$2,$3,$4,$5,$6,$7,$8) returning "reimbursementId" `,//allows you to return some values from the rows in an insert, update or delete
                                            [newReimbursement.author, newReimbursement.amount, newReimbursement.dateSubmitted, newReimbursement.dateResolved, newReimbursement.description, newReimbursement.resolver, newReimbursement.status, newReimbursement.type])
        newReimbursement.reimbursementId = results.rows[0].reimbursementId
        await client.query('COMMIT;')//ends transaction
        return newReimbursement

    }catch(e){
        client && client.query('ROLLBACK;')//if a js error takes place, undo the sql
        if(e.message === 'Status and Type Not Found'){
            throw new ReimbursementInputError()// role not found error
        }
        //if we get an error we don't know 
        console.log(e)
        throw new Error('Unhandled Error Occured')
    }finally{
        client && client.release();
    }
}