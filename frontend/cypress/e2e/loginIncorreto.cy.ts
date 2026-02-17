describe('Fluxo de Login', () => {
  const baseUrl = 'http://localhost:3000'

  it('Deve exibir erro ao tentar logar usando uma senha incorreta', () => {
    cy.visit(`${baseUrl}/login`)
    cy.get('input[name="email"]').type('rafael@teste.com')
    cy.get('input[name="password"]').type('senha_errada')
    cy.get('button[type="submit"]').click()
    
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Credenciais inválidas')
    })
  })
})