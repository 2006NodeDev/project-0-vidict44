import { Pool } from 'pg'
//entrypoint for all of the database files
// things/ config that all database files need to be completed

//build a connection pool
//a secret is any value you don't want to share with the public
export const connectionPool:Pool = new Pool({
    host: process.env['project0_HOST'],// the public ip address of you sql instance
    user: process.env['project0_USER'],//user on your database ( probably postgres)
    password: process.env['project0_PASSWORD'],//password
    database: process.env['project0_DATABASE'],//name of database
    port:5432,// the database's port
    max:5//maximum number of connections
})