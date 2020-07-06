
import { PoolClient, QueryResult } from "pg";
import { connectionPool } from ".";

import { ReimbursementNotFoundError } from "../errors/ReimbursementNotFoundError";


//import { ReimbursementDTOtoReiumbursementConvertor } from "../utils/reimbursementDTO-reimbursement-converter";
import { Reimbursement } from "../models/Reimbursement";
import { ReimbursementInputError } from "../errors/ReimbursementInputError";

export async function getAllReimbursements(statusId: number) {
    let client: PoolClient;// this will be the "connection" we borrow from the pool but 
    //that process can take some time and can fail so we declare the var ahead of time
    try {
        client = await connectionPool.connect()
        let results:QueryResult = await client.query(`set schema 'project0';`)
        results = await client.query(`select r."reimbursementId", r."author", r."amount", r."dateSubmitted" ,r."dateResolved" , r."description" , r."resolver" , r."status" , r."type" 
                                                    from project0."reimbursement" r 
                                                     join project0."reimbursementStatus" rs on r."status" = rs."statusId"
                                                     join project0."reimbursementType" rt  on r."type" = rt."typeId"
                                                     join project0."User" u on r."author" = u."userId"
                                                     where r."status" = ${statusId};`)
        return results.rows
    } catch (e) {
        //we should do some sort of error processing in this catch statement
        console.log(e)
        throw new Error('un-implemented error handling')
    } finally {
        // we make sure client isn't undefined
        client && client.release()//then we release it
    }
}

export async function findreimbursementById(userId:number) {
    let client: PoolClient;
    try{
       
        client = await connectionPool.connect()
        let results: QueryResult = await client.query(`select r."reimbursementId", r."author", r."amount", r."dateSubmitted" ,r."dateResolved" , r."description" , r."resolver" , r."status" , r."type"  
        from project0."reimbursement" r 
            join project0."reimbursementStatus" rs on r."status" = rs."statusId"
            join project0."reimbursementType" rt  on r."type" = rt."typeId"
            join project0."User" u on r."author" = u."userId"
        where r."author" = ${userId};`)//directly inputting user values is very dangerous
        //sql injction which is very bad, we will learn how to fix with a parameterized query
        
            return results.rows;
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

export async function updateReimbursementInfo(updatedReimbursementInfo:Reimbursement):Promise<Reimbursement> {
    let client:PoolClient
    try {
        client = await connectionPool.connect()
        await client.query('BEGIN;')

        if(updatedReimbursementInfo.author) {
            await client.query(`update project0."reimbursement" set "author" = $1 
                                where "reimbursementId" = $2;`, 
                                [updatedReimbursementInfo.author, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.amount) {
            await client.query(`update project0."reimbursement" set "amount" = $1 
                                where "reimbursementId" = $2;`, 
                                [updatedReimbursementInfo.amount, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.dateSubmitted) {
            await client.query(`update project0."reimbursement" set "dateSubmitted" = $1 
                                where "reimbursementId" = $2;`, 
                                [updatedReimbursementInfo.dateSubmitted, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.dateResolved) {
            await client.query(`update project0."reimbursement" set "dateResolved" = $1 
                                where "reimbursementId" = $2;`, 
                                [updatedReimbursementInfo.dateResolved, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.description) {
            await client.query(`update project0."reimbursement" set "description" = $1 
                                where "reimbursementId" = $2;`, 
                                [updatedReimbursementInfo.description, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.resolver) {
            await client.query(`update project0."reimbursement" set "resolver" = $1 
                                where "reimbursementId" = $2;`, 
                                [updatedReimbursementInfo.resolver, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.status) {
            let statusId = await client.query(`select rs."statusId" from project0."reimbursementStatus" rs 
                                            where rs."status" = $1;`, [updatedReimbursementInfo.status, updatedReimbursementInfo.reimbursementId])
            if(statusId.rowCount === 0) {
                throw new Error('Status Not Found')
            }
            statusId = statusId.rows[0].status_id
            await client.query(`update project0."reimbursement" set "status" = $1 
                                where "reimbursementId" = $2;`, 
                                [statusId, updatedReimbursementInfo.reimbursementId])
        }
        if(updatedReimbursementInfo.type) {
            let typeId = await client.query(`select rt."typeId" from project0."reimbursementType" rt 
                                            where rt."type" = $1;`, [updatedReimbursementInfo.type])
            if(typeId.rowCount === 0) {
                throw new Error('Type Not Found')
            }
            typeId = typeId.rows[0].type_id
            await client.query(`update project0."reimbursementType" set "type" = $1 
                                where "reimbursementId" = $2;`, 
                                [typeId, updatedReimbursementInfo.reimbursementId])
        }

        await client.query('COMMIT;')
        return updatedReimbursementInfo
    } catch(e) {
        client && client.query('ROLLBACK;')
        if(e.message == 'Status Not Found' || e.message == 'Type Not Found') {
            throw new Error('DAO side')
        }
        console.log(e);
        throw new Error('Unhandled Error')
    } finally {
        client && client.release()
    }
}