describe('POST /recoveryPasswordRequest', () => {

    beforeEach(function () {
        cy.fixture('Authenticate/login-users-recoveryPasswordRequest').then(function (users) {
            this.users = users
        })
    })

    it('Deve retornar sucesso na operação', function () {

        const userData = this.users.login
        cy.deletePersonForever(userData)

        cy.postPerson(userData).then((response) => {
            expect(response.status).to.eq(201)

            cy.postRecoveryPasswordRequest(userData).then((response) => {
                expect(response.status).to.eq(200)

                const body = response.body

                expect(body.success).to.be.true
                expect(body.message).to.include('Operação concluída com sucesso.')
                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(200)

            })

        })

    })

    it('Deve retornar sucesso na operação mesmo com usuário não cadastrado', function () {

        const userData = this.users.loginNoHash
        cy.deletePersonForever(userData)

        cy.postPerson(userData).then((response) => {
            expect(response.status).to.eq(201)
        })

        cy.deletePersonForever(userData)

        cy.postRecoveryPasswordRequest(userData).then((response) => {
            expect(response.status).to.eq(200)

            const body = response.body

            expect(body.success).to.be.true
            expect(body.message).to.have.length(1)
            expect(body.message).to.include('Operação concluída com sucesso.')
            expect(body.data).to.be.null
            expect(body.statusCode).to.eq(200)
        })

    })

    context('Validações do Json', () => {

        it('Não deve aceitar json mal formatado', function () {

            const userData = `{
            email: Teste@rm.com.br

            }`

            cy.postRecoveryPasswordRequest(userData).then((response) => {
                expect(response.status).to.eq(415)
                expect(response.body).to.be.empty;
            })
        })

        it('O campo email é obrigatório', function () {

            const userLogin = this.users.emailRequired

            cy.postRecoveryPasswordRequest(userLogin).then((response) => {
                expect(response.status).to.eq(400)

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O email deve ser preenchido.')
                expect(body.data).to.be.null

                expect(body.statusCode).to.eq(400)

            })

        })

    })

    context('Validações do campo', () => {

        it('O campo email não pode estar vazio', function () {

            const userLogin = this.users.loginEmailRequired

            cy.postRecoveryPasswordRequest(userLogin).then((response) => {
                expect(response.status).to.eq(400)

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(4)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O email deve ser preenchido.')
                expect(body.message).to.include("'Email' deve ser maior ou igual a 3 caracteres. Você digitou 0 caracteres.")
                expect(body.message).to.include('O email informado é inválido.')
                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(400)

            })
        })

        it('O campo email não pode ser maior que 150 caracteres', function () {

            const userLogin = this.users.emailLimit150

            cy.postRecoveryPasswordRequest(userLogin).then((response) => {
                expect(response.status).to.eq(400)

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(2)
                expect(body.message).to.include('Não foi possível concluir a operação.')

                const text = body.message.some(item => item.startsWith("'Email' deve ser menor ou igual a 150 caracteres"));
                expect(text).to.be.true;

                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(400)

            })

        })

        it('O campo email não pode ser menor que 3 caracteres', function () {

            const userLogin = this.users.emailLimit3

            cy.postRecoveryPasswordRequest(userLogin).then((response) => {
                expect(response.status).to.eq(400)

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(3)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O email informado é inválido.')

                const text = body.message.some(item => item.startsWith("'Email' deve ser maior ou igual a 3 caracteres."));
                expect(text).to.be.true;

                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(400)

            })

        })

        it('O campo email não pode ser inválido', function () {

            const userLogin = this.users.emailInvalid

            cy.postRecoveryPasswordRequest(userLogin).then((response) => {
                expect(response.status).to.eq(400)

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O email informado é inválido.')
                expect(body.data).to.be.null

                expect(body.statusCode).to.eq(400)

            })
        })
    })
})