Cypress.Commands.add('deletePersonForever', (userToDelete) => {

    cy.fixture('admin-UserApp').then(function (users) {
        const userAdmin = users.loginAdmin

        cy.postLogin(userAdmin).then((response) => {
            Cypress.env('authTokenAdmin', response.body.data.authToken)
            cy.deletePerson(userToDelete.email, userAdmin.password).then(response => {
                expect([404, 401, 500]).to.not.include(response.status)
            })

        })
    })
})