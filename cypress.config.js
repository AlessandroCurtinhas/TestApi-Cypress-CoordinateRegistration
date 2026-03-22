const { defineConfig } = require("cypress");
const { execSQLQuery } = require('./cypress/support/sqlServer')

require('dotenv').config()

module.exports = defineConfig({
  allowCypressEnv: true,
  e2e: {
    async setupNodeEvents(on, config) {

      on('task', {
        async execucao() {
          const results = await execSQLQuery('SELECT * FROM person')
          return results
        },
        async getHashRecoveryByEmail(email) {
          const results = await execSQLQuery(`SELECT RECOVERYHASH, PASSWORDDATEREQUEST FROM PERSON WHERE EMAIl = '${email}'`)
          return results
        },
        async upatadeDatePasswordRecoveryByEmail(email) {
          const results = await execSQLQuery(`UPDATE PERSON SET PASSWORDDATEREQUEST = DATEADD(minute, -${process.env.REMOVE_MINUTES_DATE_PASSWORD_RECOVERY}, PASSWORDDATEREQUEST) where EMAIL = '${email}'`)
          return null
        }

      })
    },
    baseUrl: process.env.BASE_URL
  },
});

