// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

//Authenticate
import './actions/prepareUserdata.actions'

Cypress.Commands.add('postLogin', (user) => {
    cy.api({
        method: 'POST',
        url: '/login',
        body: user,
        headers: {
            'Content-Type': 'application/json'
        },
        failOnStatusCode: false
    }).then(response => { return response })
})

Cypress.Commands.add('postPerson', (user) => {
    cy.api({
        method: 'POST',
        url: '/person',
        body: user,
        headers: {
            'Content-Type': 'application/json'
        },
        failOnStatusCode: false
    }).then(response => { return response })
})

Cypress.Commands.add('postRecoveryPasswordRequest', (email) => {
    cy.api({
        method: 'POST',
        url: '/recoveryPasswordRequest',
        body: email,
        failOnStatusCode: false
    }).then(response => { return response })
})

Cypress.Commands.add('postRecovery', (recoveryHash,user) => {
    cy.api({
        method: 'POST',
        url: `/recoveryPassword/${recoveryHash}`,
        body: user,
        failOnStatusCode: false
    }).then(response => { return response })
})


// Implementação de deleção de usuários para permitir testes
Cypress.Commands.add('deletePerson', (email, password) => {
    cy.api({
        method: 'DELETE',
        url: `/person/deletePersonForever/${email}`,
        headers: {
            'Authorization': 'Bearer ' + Cypress.env('authTokenAdmin'),
            'Content-Type': 'application/json'
        },
        body: {
            'password': password,
            "confirmedPassword": password
        },
        failOnStatusCode: false
    }).then(response => { return response })
})




