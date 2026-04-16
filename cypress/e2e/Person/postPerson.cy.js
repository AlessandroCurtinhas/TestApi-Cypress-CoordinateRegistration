describe('POST /person', () => {

    beforeEach(function () {
        cy.fixture('Person/person-users').then(function (users) {
            this.users = users
        })
    })

    it('Deve cadastrar um novo usuário', function () {
        const userData = this.users.login

        cy.deletePersonForever(userData)

        cy.postPerson(userData).then((response) => {
            expect(response.status).to.eq(201)

            const body = response.body

            expect(body.success).to.be.true
            expect(body.message).to.have.length(1)

            expect(body.data.hash).not.to.be.empty
            expect(body.data.name).to.eq(userData.name)
            expect(body.data.email).to.eq(userData.email)
            expect(body.message).to.have.length(1)
            expect(body.message).to.include('Operação concluída com sucesso.')
            expect(body.data.dateCreated).not.to.be.empty
            expect(body.data.dateCreated).not.to.be.empty
            expect(body.data.dateUpdated).to.be.null
            expect(body.data.cities).not.to.be.null
            expect(body.statusCode).to.eq(201)
            expect(body.data.cities).to.be.an('Array')

            for (let index = 0; index < body.data.cities.length; index++) {
                expect(body.data.cities[index].hash).not.be.empty
                expect(body.data.cities[index]).to.include(userData.cities[index])

            }

            cy.postLogin(userData).then((responseLogin) => {
                expect(responseLogin.status).to.eq(200)
            })

        })
    })

    it('Não deve cadastrar um novo usuário com e-mail já cadastrado', function () {
        const userData = this.users.loginEmailExists
        const newUser = this.users.loginNewEmailExists

        cy.deletePersonForever(userData)

        cy.postPerson(userData).then((response) => {
            expect(response.status).to.eq(201)

            cy.postLogin(userData).then((responseLogin) => {
                expect(responseLogin.status).to.eq(200)
            })

            cy.postPerson(newUser).then((response) => {
                expect(response.status).to.eq(409)

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(2)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O usuário não pode ser criado com este e-mail.')
                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(409)

            })

        })
    })

    context('Campos obrigátorios no Json', function () {

        it('Não deve aceitar um json mal formatado.', function () {
            const userData = `
        {
        "name": Isa,
        "email": isinha@gmail.com
        password": "Teste@123"
        "confirmedPassword": "Teste@123",
        "cities": [
            {
                "name": "Santos",
                "state": "São Paulo",
                "uf": "SP"
            }
        ]
    }`

            cy.postPerson(userData).then((response) => {
                expect(response.status).to.eq(400)

            })


        })

        it('O campo nome é obrigatório', function () {

            const userData = this.users.loginNameRequired

            cy.postPerson(userData).then((response) => {

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(2)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O nome deve ser preenchido.')
                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(400)

            })

        })

        it('O campo email é obrigatório', function () {

            const userData = this.users.loginEmailRequired

            cy.postPerson(userData).then((response) => {

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(2)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O email deve ser preenchido.')
                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(400)

            })

        })

        it('O campo senha é obrigatório', function () {

            const userData = this.users.loginPasswordRequired

            cy.postPerson(userData).then((response) => {

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(3)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('A senha é obrigatória.')
                expect(body.message).to.include('As senhas devem ser iguais.')
                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(400)

            })

        })

        it('O campo confirmação de senha é obrigatório', function () {

            const userData = this.users.loginConfirmedPasswordRequired

            cy.postPerson(userData).then((response) => {

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(3)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('A confirmação de senha é obrigatória.')
                expect(body.message).to.include('As senhas devem ser iguais.')
                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(400)

            })

        })

        it('O campo cidades é obrigatório', function () {

            const userData = this.users.loginCitiesRequired

            cy.postPerson(userData).then((response) => {

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(2)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('A cidade é obrigatória.')
                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(400)

            })

        })

        it('O campo nome da cidade é obrigatório', function () {

            const userData = this.users.loginCityNameRequired

            cy.postPerson(userData).then((response) => {

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(2)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O nome da cidade deve ser preenchido.')
                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(400)

            })

        })

        it('O campo estado é obrigatório', function () {

            const userData = this.users.loginStateRequired

            cy.postPerson(userData).then((response) => {

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(2)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('O nome do estado deve ser preenchido.')
                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(400)

            })

        })

        it('O campo uf é obrigatório', function () {

            const userData = this.users.loginUfRequired

            cy.postPerson(userData).then((response) => {

                const body = response.body

                expect(body.success).to.be.false
                expect(body.message).to.have.length(2)
                expect(body.message).to.include('Não foi possível concluir a operação.')
                expect(body.message).to.include('A Unidade Federativa (UF) do estado deve ser preenchido.')
                expect(body.data).to.be.null
                expect(body.statusCode).to.eq(400)

            })

        })

    })

    context('Validação dos campos', function () {


        context('Validação do campo nome', function () {

            it('Não deve cadastrar um novo usuário sem o campo nome preenchido', function () {

                const userData = this.users.loginNameEmpty

                cy.postPerson(userData).then((response) => {

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(4)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('O nome deve ser preenchido.')
                    expect(body.message).to.include('O nome não deve conter caracteres especiais.')
                    expect(body.message).to.include("'Name' deve ser maior ou igual a 5 caracteres. Você digitou 0 caracteres.")
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo nome menor que 5 caracteres', function () {

                const userLogin = this.users.loginNameLimit3

                cy.postPerson(userLogin).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(2)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include("'Name' deve ser maior ou igual a 5 caracteres. Você digitou 3 caracteres.")
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo nome maior que 150 caracteres', function () {

                const userLogin = this.users.loginNameLimit150

                cy.postPerson(userLogin).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(2)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include("'Name' deve ser menor ou igual a 150 caracteres. Você digitou 154 caracteres.")
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo nome contendo caracteres especiais.', function () {

                const userLogin = this.users.loginNameNoSpecChar

                cy.postPerson(userLogin).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(2)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include("O nome não deve conter caracteres especiais.")
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

        })

        context('Validação do campo email', function () {

            it('Não deve cadastrar um novo usuário sem o campo email preenchido', function () {

                const userData = this.users.loginEmailEmpty

                cy.postPerson(userData).then((response) => {

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

            it('Não deve cadastrar um novo usuário com o campo email inválido', function () {

                const userData = this.users.loginEmailInvalid

                cy.postPerson(userData).then((response) => {

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(2)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('O email informado é inválido.')
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo email menor que 3 caracteres', function () {

                const userLogin = this.users.emailLimit3

                cy.postPerson(userLogin).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(3)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('O email informado é inválido.')
                    expect(body.message).to.include("'Email' deve ser maior ou igual a 3 caracteres. Você digitou 2 caracteres.")
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo email maior que 150 caracteres', function () {

                const userLogin = this.users.emailLimit150

                cy.postPerson(userLogin).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(2)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include("'Email' deve ser menor ou igual a 150 caracteres. Você digitou 151 caracteres.")

                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

        })

        context('Validação dos campos senha e confirmação de senha', function () {

            it('Não deve cadastrar um novo usuário com os campos senha e confirmação de senha sem preenchimento', function () {
                const userLoginPasswordEmpty = this.users.loginPasswordEmpty
                const userLoginConfirmedPasswordEmpty = this.users.loginConfirmedPasswordEmpty

                cy.postPerson(userLoginPasswordEmpty).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('A senha é obrigatória.')
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

                cy.postPerson(userLoginConfirmedPasswordEmpty).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(3)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('A confirmação de senha é obrigatória.')
                    expect(body.message).to.include('As senhas devem ser iguais.')
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })
            })

            it('Não deve cadastrar um novo usuário com os campos senha e confirmação de senha divergentes', function () {
                const userLogin = this.users.loginConfirmedPasswordAndPasswordNotEquals


                cy.postPerson(userLogin).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(2)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('As senhas devem ser iguais.')
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo senha menor que 8 caracteres.', function () {
                const userLogin = this.users.loginPasswordLimit8


                cy.postPerson(userLogin).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(2)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('A senha deve ter pelo menos 8 caracteres.')
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo senha sem conter pelo menos 1 letra maiúscula.', function () {
                const userLogin = this.users.loginPasswordUpperChar


                cy.postPerson(userLogin).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(2)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('A senha deve conter pelo menos uma letra maiúscula.')
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo senha sem conter pelo menos 1 letra miniscula.', function () {
                const userLogin = this.users.loginCPasswordLowerCaseChar


                cy.postPerson(userLogin).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(2)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('A senha deve conter pelo menos uma letra minúscula.')
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo senha sem conter pelo menos 1 numeral.', function () {
                const userLogin = this.users.loginPasswordNumber


                cy.postPerson(userLogin).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(2)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('A senha deve conter pelo menos um número.')
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo senha sem conter pelo menos 1 caractere especial.', function () {
                const userLogin = this.users.loginPasswordSpecChar

                cy.postPerson(userLogin).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.have.length(2)
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('A senha deve conter pelo menos um caractere especial.')
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

        })

        context('Validação dos campos cidade, estado e UF', function () {

            it('Não deve cadastrar um novo usuário com os campos cidade, estado e UF sem preenchimento', function () {
                const userLoginCityEmpty = this.users.loginCityEmpty
                const userLoginStateEmpty = this.users.loginStateEmpty
                const userLoginUFEmpty = this.users.loginUFEmpty

                cy.postPerson(userLoginCityEmpty).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('O nome da cidade deve ser preenchido.')
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

                cy.postPerson(userLoginStateEmpty).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('O nome do estado deve ser preenchido.')
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

                cy.postPerson(userLoginUFEmpty).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include('A Unidade Federativa (UF) do estado deve ser preenchido.')
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo UF contendo um preenchimento diferente de 2 caracteres', function () {
                const userLoginUFLimit2 = this.users.loginUFLimit2
                const userloginUFLimit1 = this.users.loginUFLimit1

                cy.postPerson(userLoginUFLimit2).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include("'UF' deve ter exatamente 2 caracteres. Você digitou 3 caracteres.")
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

                cy.postPerson(userloginUFLimit1).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include("'UF' deve ter exatamente 2 caracteres. Você digitou 1 caracteres.")
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo UF contendo um preenchimento diferente de letras maisculas.', function () {
                const userLoginUFUpperChar = this.users.loginUFUpperChar
                const userLoginUFNumber = this.users.loginUFNumber
                const userLoginUFAccentChar = this.users.loginUFAccentChar


                cy.postPerson(userLoginUFUpperChar).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include("A Unidade Federativa (UF) deve ser preenchida apenas letras maiúsculas.")
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

                cy.postPerson(userLoginUFNumber).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include("A Unidade Federativa (UF) deve ser preenchida apenas letras maiúsculas.")
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

                cy.postPerson(userLoginUFAccentChar).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include("A Unidade Federativa (UF) deve ser preenchida apenas letras maiúsculas.")
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })



            })

            it('Não deve cadastrar um novo usuário com o campo estado sem preenchimento', function () {
                const userloginStateEmpty = this.users.loginStateEmpty

                cy.postPerson(userloginStateEmpty).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include("O nome do estado deve ser preenchido.")
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

            it('Não deve cadastrar um novo usuário com o campo cidade estado sem preenchimento', function () {
                const userloginStateEmpty = this.users.loginCityEmpty

                cy.postPerson(userloginStateEmpty).then((response) => {
                    expect(response.status).to.eq(400)

                    const body = response.body

                    expect(body.success).to.be.false
                    expect(body.message).to.include('Não foi possível concluir a operação.')
                    expect(body.message).to.include("O nome da cidade deve ser preenchido.")
                    expect(body.data).to.be.null
                    expect(body.statusCode).to.eq(400)

                })

            })

        })

    })



})