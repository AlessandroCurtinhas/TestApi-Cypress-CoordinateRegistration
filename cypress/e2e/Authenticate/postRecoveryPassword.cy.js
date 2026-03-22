describe('POST /recoveryPassword', () => {

    beforeEach(function () {
        cy.fixture('Authenticate/login-users-RecoveryPassword').then(function (users) {
            this.users = users
        })
    })

    it('Deve alterar a senha com sucesso', function () {
        const userData = this.users.login
        const userNewData = this.users.loginNewPassword

        cy.deletePersonForever(userData)

        cy.postPerson(userData).then((responseUser) => {
            expect(responseUser.status).to.eq(201)

            cy.postRecoveryPasswordRequest(userData).then((response) => {
                expect(response.status).to.eq(200)

                cy.task('getHashRecoveryByEmail', responseUser.body.data.email)
                    .then(response => {

                        const recovery = response[0]

                        expect(recovery.RECOVERYHASH).to.be.not.null
                        expect(recovery.PASSWORDDATEREQUEST).to.be.not.null

                        userNewData.RecoveryHash = response[0].RECOVERYHASH

                        cy.postRecovery(userNewData)
                            .then(responseRecovery => {
                                expect(responseRecovery.status).to.eq(200)

                                const body = responseRecovery.body

                                expect(body.success).to.be.true
                                expect(body.message).to.have.length(1)
                                expect(body.message).to.include('Operação concluída com sucesso.')
                                expect(body.data.hash).to.eq(responseUser.body.data.hash)
                                expect(body.data.name).to.eq(userData.name)
                                expect(body.data.email).to.eq(userData.email)
                                expect(body.data.dateCreated).to.be.not.null
                                expect(body.data.dateUpdated).to.be.not.null
                                expect(body.statusCode).to.be.eq(200)

                            })

                    })

            })


        })

        cy.postLogin(userNewData).then(response => {
            expect(response.status).to.eq(200)

        })

    })

    it('Após 30 minutos não deve ser possível recuperar a senha', function () {
        const userData = this.users.loginAdd30Min
        const userNewData = this.users.loginAdd30MinNewPassword

        cy.deletePersonForever(userData)

        cy.postPerson(userData).then((responseUser) => {
            expect(responseUser.status).to.eq(201)

            cy.postRecoveryPasswordRequest(userData).then((response) => {
                expect(response.status).to.eq(200)

                cy.task('getHashRecoveryByEmail', responseUser.body.data.email)
                    .then(response => {

                        const recovery = response[0]

                        expect(recovery.RECOVERYHASH).to.be.not.null
                        expect(recovery.PASSWORDDATEREQUEST).to.be.not.null

                        userNewData.RecoveryHash = response[0].RECOVERYHASH

                        cy.task('upatadeDatePasswordRecoveryByEmail', responseUser.body.data.email)


                        cy.postRecovery(userNewData)
                            .then(responseRecovery => {
                                expect(responseRecovery.status).to.eq(401)

                                const body = responseRecovery.body

                                expect(body.success).to.be.false
                                expect(body.message).to.have.length(2)
                                expect(body.message).to.include('Não foi possível concluir a operação.')
                                expect(body.message).to.include('O tempo do token de recuperação de senha expirou.')
                                expect(body.data).to.be.null
                                expect(body.statusCode).to.be.eq(401)

                            })

                    })

            })

        })

    })

    context('Validações do Json', () => {

        it('Não deve aceitar json mal formatado', function () {

            const userData = `{
            password: "Teste@123",
            "confirmedPassword": Teste@123

            }`

            cy.postRecovery(userData).then((response) => {
                expect(response.status).to.eq(415)
                expect(response.body).to.be.empty;
            })
        })

        it('O campo senha é obrigatório', function () {

            const userLogin = this.users.passwordRequired

            cy.postRecovery(userLogin).then((response) => {
                expect(response.status).to.eq(400)

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(2)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O Json está mal formatado.')
                expect(body.data).to.be.null

                expect(body.statusCode).to.eq(400)

            })

        })

        it('O campo de confirmação de senha é obrigatório', function () {

            const userLogin = this.users.confirmedPasswordRequired

            cy.postRecovery(userLogin).then((response) => {
                expect(response.status).to.eq(400)

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(2)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O Json está mal formatado.')
                expect(body.data).to.be.null

                expect(body.statusCode).to.eq(400)

            })

        })

        it('O campo "RecoveryHash" é obrigatório', function () {

            const userLogin = this.users.recoveryHashRequired

            cy.postRecovery(userLogin).then((response) => {
                expect(response.status).to.eq(400)

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(2)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O hash de recuperação é obrigatório.')
                expect(body.data).to.be.null

                expect(body.statusCode).to.eq(400)

            })

        })

        it('O campo "RecoveryHash", senha e confirmação de senha são obrigatórios', function () {

            const userLogin = this.users.recoveryHashPasswordConfirmedPasswordRequired

            cy.postRecovery(userLogin).then((response) => {
                expect(response.status).to.eq(400)

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(4)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O hash de recuperação é obrigatório.')
                expect(body.message).to.include('A confirmação da senha é obrigatória.')
                expect(body.message).to.include('O hash de recuperação é obrigatório.')
                expect(body.data).to.be.null

                expect(body.statusCode).to.eq(400)

            })

        })

    })

    context('Validações dos campos', () => {

        it('A senha de confirmação não pode ser diferente', function () {
            const userData = this.users.loginDiffPassword
            const userNewData = this.users.loginDiffPasswordRecovery

            cy.deletePersonForever(userData)

            cy.postPerson(userData).then(responseUser => {
                expect(responseUser.status).to.eq(201)

                cy.postRecoveryPasswordRequest(userData).then(response => {
                    expect(response.status).to.eq(200)

                    cy.task('getHashRecoveryByEmail', responseUser.body.data.email)
                        .then(response => {

                            const recovery = response[0]

                            expect(recovery.RECOVERYHASH).to.be.not.null
                            expect(recovery.PASSWORDDATEREQUEST).to.be.not.null

                            userNewData.RecoveryHash = response[0].RECOVERYHASH

                            cy.postRecovery(userNewData)
                                .then(responseRecovery => {
                                    expect(responseRecovery.status).to.eq(400)

                                    const body = responseRecovery.body

                                    expect(body.success).to.be.false
                                    expect(body.message).to.have.length(2)
                                    expect(body.message).to.include('Não foi possível concluir a operação.')
                                    expect(body.message).to.include('As senhas devem ser iguais.')
                                    expect(body.data).to.be.null
                                    expect(body.statusCode).to.be.eq(400)

                                })

                        })
                })
            })

        })

    })

})