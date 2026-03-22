const sql = require("mssql")
require('dotenv').config()

const connStr = process.env.CONNECTION_STRING

async function getConnection() {
    await sql.connect(connStr)
}

getConnection()

async function execSQLQuery(sqlQry) {
    await getConnection()
    const request = new sql.Request()
    const { recordset } = await request.query(sqlQry)
    return recordset

}

module.exports = {execSQLQuery} 

