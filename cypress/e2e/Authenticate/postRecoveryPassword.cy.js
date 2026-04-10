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

                        const recoveryHash = recovery.RECOVERYHASH

                        cy.postRecovery(recoveryHash, userNewData)
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

                        const recoveryHash = recovery.RECOVERYHASH

                        cy.task('upatadeDatePasswordRecoveryByEmail', responseUser.body.data.email)

                        cy.postRecovery(recoveryHash, userNewData)
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

    it('Não deve recuperar a senha com hash não registrado', function () {
        const userNewData = this.users.loginHashWrong
        const recoveryHash = '21614D7B-5E28-4F33-83A5-831136232122'

        cy.postRecovery(recoveryHash, userNewData)
            .then(responseRecovery => {
                expect(responseRecovery.status).to.eq(404)

                const body = responseRecovery.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(2)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O usuário não foi encontrado na base de dados.')
                expect(body.data).to.be.null
                expect(body.statusCode).to.be.eq(404)

            })


    })

    it('Hash de recuperação de senha é obrigatório', function () {
        const userNewData = this.users.loginHashRequired
        const recoveryHash = ''

        cy.postRecovery(recoveryHash, userNewData)
            .then(responseRecovery => {
                expect(responseRecovery.status).to.eq(405)
                expect(responseRecovery.body).to.be.undefined
            })

    })

    context('Validações do Json', () => {

        it('Não deve aceitar json mal formatado', function () {

            const userData = this.users.loginBadJson

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

                            const recoveryHash = recovery.RECOVERYHASH

                            const userNewData = `{
                            password: "Teste@123",
                            "confirmedPassword": Teste@123
                            }`

                            cy.postRecovery(recoveryHash, userNewData)
                                .then(responseRecovery => {
                                    expect(responseRecovery.status).to.eq(415)
                                    expect(responseRecovery.body).to.be.empty;
                                })
                        })

                })

            })
        })

        it('O campo senha é obrigatório', function () {

            const userLogin = this.users.userPasswordRequired
            const userNewData = this.users.passwordRequired

            cy.deletePersonForever(userLogin)

            cy.postPerson(userLogin).then((responseUser) => {
                expect(responseUser.status).to.eq(201)

                cy.postRecoveryPasswordRequest(userLogin).then((response) => {
                    expect(response.status).to.eq(200)

                    cy.task('getHashRecoveryByEmail', responseUser.body.data.email)
                        .then(response => {

                            const recovery = response[0]

                            expect(recovery.RECOVERYHASH).to.be.not.null
                            expect(recovery.PASSWORDDATEREQUEST).to.be.not.null

                            const recoveryHash = recovery.RECOVERYHASH

                            cy.postRecovery(recoveryHash, userNewData)
                                .then(responseRecovery => {
                                    expect(responseRecovery.status).to.eq(400)

                                    const body = responseRecovery.body

                                    expect(body.success).to.be.false
                                    expect(body.message).to.have.length(2)
                                    expect(body.message).to.include('Não foi possível concluir a operação.')
                                    expect(body.message).to.include('As senhas devem ser iguais.')
                                    expect(body.data).to.be.null

                                    expect(body.statusCode).to.eq(400)

                                })
                        })
                })

            })
        })

        it('O campo de confirmação de senha é obrigatório', function () {

            const userLogin = this.users.userConfirmedPasswordRequired
            const userNewData = this.users.confirmedPasswordRequired

            cy.deletePersonForever(userLogin)

            cy.postPerson(userLogin).then((responseUser) => {
                expect(responseUser.status).to.eq(201)

                cy.postRecoveryPasswordRequest(userLogin).then((response) => {
                    expect(response.status).to.eq(200)

                    cy.task('getHashRecoveryByEmail', responseUser.body.data.email)
                        .then(response => {

                            const recovery = response[0]

                            expect(recovery.RECOVERYHASH).to.be.not.null
                            expect(recovery.PASSWORDDATEREQUEST).to.be.not.null

                            const recoveryHash = recovery.RECOVERYHASH

                            cy.postRecovery(recoveryHash, userNewData)
                                .then(responseRecovery => {
                                    expect(responseRecovery.status).to.eq(400)

                                    const body = responseRecovery.body

                                    expect(body.success).to.be.false
                                    expect(body.message).to.have.length(4)
                                    expect(body.message).to.include('Não foi possível concluir a operação.')
                                    expect(body.message).to.include('As senhas devem ser iguais.')
                                    expect(body.message).to.include('A confirmação da senha é obrigatória.')
                                    expect(body.message).to.include('A senha é obrigatória.')
                                    expect(body.data).to.be.null

                                    expect(body.statusCode).to.eq(400)

                                })

                        })
                })

            })

        })

        it('A senha e a confirmação de senha são obrigatórios', function () {

            const userLogin = this.users.userPasswordConfirmedPasswordRequired
            const userNewData = this.users.passwordConfirmedPasswordRequired

            cy.deletePersonForever(userLogin)

            cy.postPerson(userLogin).then((responseUser) => {
                expect(responseUser.status).to.eq(201)

                cy.postRecoveryPasswordRequest(userLogin).then((response) => {
                    expect(response.status).to.eq(200)

                    cy.task('getHashRecoveryByEmail', responseUser.body.data.email)
                        .then(response => {

                            const recovery = response[0]

                            expect(recovery.RECOVERYHASH).to.be.not.null
                            expect(recovery.PASSWORDDATEREQUEST).to.be.not.null

                            const recoveryHash = recovery.RECOVERYHASH

                            cy.postRecovery(recoveryHash, userNewData)
                                .then(responseRecovery => {
                                    expect(responseRecovery.status).to.eq(400)

                                    const body = responseRecovery.body

                                    expect(body.success).to.be.false
                                    expect(body.message).to.have.length(3)
                                    expect(body.message).to.include('Não foi possível concluir a operação.')
                                    expect(body.message).to.include('A confirmação da senha é obrigatória.')
                                    expect(body.message).to.include('A senha é obrigatória.')
                                    expect(body.data).to.be.null

                                    expect(body.statusCode).to.eq(400)

                                })

                        })
                })

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

                            const recoveryHash = recovery.RECOVERYHASH

                            cy.postRecovery(recoveryHash, userNewData)
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

        it('A senha é obrigatória', function () {
            const userData = this.users.userPasswordRequired
            const userNewData = this.users.userPasswordRequiredRequest

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

                            const recoveryHash = recovery.RECOVERYHASH

                            cy.postRecovery(recoveryHash, userNewData)
                                .then(responseRecovery => {
                                    expect(responseRecovery.status).to.eq(400)

                                    const body = responseRecovery.body

                                    expect(body.success).to.be.false
                                    expect(body.message).to.include('Não foi possível concluir a operação.')
                                    expect(body.message).to.include('A senha é obrigatória.')
                                    expect(body.data).to.be.null
                                    expect(body.statusCode).to.be.eq(400)

                                })

                        })
                })
            })

        })

        it('A confirmação de senha é obrigatória', function () {
            const userData = this.users.userConfirmedPasswordRequired
            const userNewData = this.users.userConfirmedPasswordRequiredRequest

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

                            const recoveryHash = recovery.RECOVERYHASH

                            cy.postRecovery(recoveryHash, userNewData)
                                .then(responseRecovery => {
                                    expect(responseRecovery.status).to.eq(400)

                                    const body = responseRecovery.body

                                    expect(body.success).to.be.false
                                    expect(body.message).to.include('Não foi possível concluir a operação.')
                                    expect(body.message).to.include('As senhas devem ser iguais.')
                                    expect(body.data).to.be.null
                                    expect(body.statusCode).to.be.eq(400)

                                })

                        })
                })
            })

        })

        it('A senha deve ter pelo menos 8 caracteres', function () {
            const userData = this.users.userPasswordMinRequired
            const userNewData = this.users.userPasswordMinRequiredRequest

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

                            const recoveryHash = recovery.RECOVERYHASH

                            cy.postRecovery(recoveryHash, userNewData)
                                .then(responseRecovery => {
                                    expect(responseRecovery.status).to.eq(400)

                                    const body = responseRecovery.body

                                    expect(body.success).to.be.false
                                    expect(body.message).to.have.length(2)
                                    expect(body.message).to.include('Não foi possível concluir a operação.')
                                    expect(body.message).to.include('A senha deve ter pelo menos 8 caracteres.')
                                    expect(body.data).to.be.null
                                    expect(body.statusCode).to.be.eq(400)

                                })

                        })
                })
            })

        })

        it('A senha deve ter pelo menos 1 caracterer maiúsculo', function () {
            const userData = this.users.userPasswordUppercaseRequired
            const userNewData = this.users.userPasswordUppercaseRequiredRequest

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

                            const recoveryHash = recovery.RECOVERYHASH

                            cy.postRecovery(recoveryHash, userNewData)
                                .then(responseRecovery => {
                                    expect(responseRecovery.status).to.eq(400)

                                    const body = responseRecovery.body

                                    expect(body.success).to.be.false
                                    expect(body.message).to.have.length(2)
                                    expect(body.message).to.include('Não foi possível concluir a operação.')
                                    expect(body.message).to.include('A senha deve conter pelo menos uma letra maiúscula.')
                                    expect(body.data).to.be.null
                                    expect(body.statusCode).to.be.eq(400)

                                })

                        })
                })
            })

        })

        it('A senha deve ter pelo menos 1 caracterer minúsculo', function () {
            const userData = this.users.userPasswordLowercaseRequired
            const userNewData = this.users.userPasswordLowercaseRequiredRequest

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

                            const recoveryHash = recovery.RECOVERYHASH

                            cy.postRecovery(recoveryHash, userNewData)
                                .then(responseRecovery => {
                                    expect(responseRecovery.status).to.eq(400)

                                    const body = responseRecovery.body

                                    expect(body.success).to.be.false
                                    expect(body.message).to.have.length(2)
                                    expect(body.message).to.include('Não foi possível concluir a operação.')
                                    expect(body.message).to.include('A senha deve conter pelo menos uma letra minúscula.')
                                    expect(body.data).to.be.null
                                    expect(body.statusCode).to.be.eq(400)

                                })

                        })
                })
            })


        })

        it('A senha deve ter pelo menos 1 caracterer numeral', function () {
            const userData = this.users.userPasswordNumRequired
            const userNewData = this.users.userPasswordNumRequiredRequest

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

                            const recoveryHash = recovery.RECOVERYHASH

                            cy.postRecovery(recoveryHash, userNewData)
                                .then(responseRecovery => {
                                    expect(responseRecovery.status).to.eq(400)

                                    const body = responseRecovery.body

                                    expect(body.success).to.be.false
                                    expect(body.message).to.have.length(2)
                                    expect(body.message).to.include('Não foi possível concluir a operação.')
                                    expect(body.message).to.include('A senha deve conter pelo menos um número.')
                                    expect(body.data).to.be.null
                                    expect(body.statusCode).to.be.eq(400)

                                })

                        })
                })
            })

        })

        it('A senha deve ter pelo menos 1 caracterer especial', function () {
            const userData = this.users.userPasswordSpecRequired
            const userNewData = this.users.userPasswordSpecRequiredRequest

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

                            const recoveryHash = recovery.RECOVERYHASH

                            cy.postRecovery(recoveryHash, userNewData)
                                .then(responseRecovery => {
                                    expect(responseRecovery.status).to.eq(400)

                                    const body = responseRecovery.body

                                    expect(body.success).to.be.false
                                    expect(body.message).to.have.length(2)
                                    expect(body.message).to.include('Não foi possível concluir a operação.')
                                    expect(body.message).to.include('A senha deve conter pelo menos um caractere especial.')
                                    expect(body.data).to.be.null
                                    expect(body.statusCode).to.be.eq(400)

                                })

                        })
                })
            })

        })

    })
})