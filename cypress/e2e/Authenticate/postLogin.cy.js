describe('POST /login', () => {

  beforeEach(function () {
    cy.fixture('Authenticate/login-users').then(function (users) {
      this.users = users
    })
  })

  it('Deve realizar o login', function () {
    const userData = this.users.login

    cy.deletePersonForever(userData)

    cy.postPerson(userData).then((response) => {
      expect(response.status).to.eq(201)
      const newUser = response.body.data

      cy.postLogin(userData).then((response) => {
        expect(response.status).to.eq(200)

        const body = response.body

        expect(body.success).to.be.true
        expect(body.message).to.have.length(1)
        expect(body.data.hash).not.to.be.empty
        expect(body.data.name).to.eq(newUser.name)
        expect(body.data.email).to.eq(newUser.email)
        expect(body.data.authToken).not.to.be.empty
        expect(body.statusCode).to.eq(200)

      })
    })
  })

  it('Não deve realizar o login com senha incorreta', function () {

    const userData = this.users.login
    const userLogin = this.users.passwordwrong

    cy.deletePersonForever(userData)

    cy.postPerson(userData).then((response) => {
      expect(response.status).to.eq(201)
    })

    cy.postLogin(userLogin).then((response) => {
      expect(response.status).to.eq(401)

      const body = response.body

      expect(body.success).to.be.false
      expect(body.message).to.have.length(2)
      expect(body.message).to.include('Não foi possível concluir a operação.')
      expect(body.message).to.include('Email ou Senha inválidos.')
      expect(body.data).to.be.null
      expect(body.statusCode).to.eq(401)

    })
  })

  it('Não deve realizar o login com email não cadastrado', function () {

    const userLogin = this.users.emailnotFound
    cy.deletePersonForever(userLogin)

    cy.postLogin(userLogin).then((response) => {
      expect(response.status).to.eq(401)

      const body = response.body

      expect(body.success).to.be.false
      expect(body.message).to.have.length(2)
      expect(body.message).to.include('Não foi possível concluir a operação.')
      expect(body.message).to.include('Email ou Senha inválidos.')
      expect(body.data).to.be.null
      expect(body.statusCode).to.eq(401)

    })
  })

  it('Não deve aceitar json mal formatado', function () {

    const userLogin = `{
        name: 'Fernando Papito'
        password: 'pwd123'
    }`

    cy.postLogin(userLogin).then((response) => {
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

  context('Campos obrigatórios no Json', function () {

    beforeEach(function () {
      cy.fixture('Authenticate/login-users').then(function (users) {
        this.users = users
      })
    })

    it('O campo email é obrigatório', function () {

      const userLogin = this.users.emailRequired

      cy.postLogin(userLogin).then((response) => {
        expect(response.status).to.eq(400)

        const body = response.body

        expect(body.success).to.be.false
        expect(body.message).to.have.length(2)
        expect(body.message).to.include('Não foi possível concluir a operação.')
        expect(body.message).to.include('O email deve ser preenchido.')
        expect(body.data).to.be.null
        expect(body.statusCode).to.eq(400)

      })
    })

    it('O campo senha e email são obrigatórios', function () {

      const userLogin = this.users.emailPasswordRequired

      cy.postLogin(userLogin).then((response) => {
        expect(response.status).to.eq(400)

        const body = response.body

        expect(body.success).to.be.false
        expect(body.message).to.have.length(3)
        expect(body.message).to.include('Não foi possível concluir a operação.')
        expect(body.message).to.include('O email deve ser preenchido.')
        expect(body.message).to.include('A senha deve ser preenchida.')
        expect(body.data).to.be.null
        expect(body.statusCode).to.eq(400)

      })

    })

    it('O campo senha é obrigatório', function () {
      const userLogin = this.users.passwordRequired

      cy.postLogin(userLogin).then((response) => {
        expect(response.status).to.eq(400)

        const body = response.body

        expect(body.success).to.be.false
        expect(body.message).to.have.length(2)
        expect(body.message).to.include('Não foi possível concluir a operação.')
        expect(body.message).to.include('A senha deve ser preenchida.')
        expect(body.data).to.be.null
        expect(body.statusCode).to.eq(400)

      })
    })
    
  })

  context('Validação dos campos', () => {

    beforeEach(function () {
      cy.fixture('Authenticate/login-users').then(function (users) {
        this.users = users
      })
    })

    it('O campo email não pode estar vazio', function () {
      const userLogin = this.users.emailEmpty

      cy.postLogin(userLogin).then((response) => {
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

    it('O campo senha não pode estar vazio', function () {
      const userLogin = this.users.passwordEmpty

      cy.postLogin(userLogin).then((response) => {
        expect(response.status).to.eq(400)

        const body = response.body

        expect(body.success).to.be.false
        expect(body.message).to.have.length(2)
        expect(body.message).to.include('Não foi possível concluir a operação.')
        expect(body.message).to.include('A senha deve ser preenchida.')
        expect(body.data).to.be.null
        expect(body.statusCode).to.eq(400)

      })
    })

    it('O campo email não pode ser maior que 150 caracteres', function () {

      const userLogin = this.users.emailLimit150

      cy.postLogin(userLogin).then((response) => {
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

      cy.postLogin(userLogin).then((response) => {
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

      cy.postLogin(userLogin).then((response) => {
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