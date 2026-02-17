describe('Fluxo de Cadastro', () => {
  const baseUrl = 'http://localhost:3000'

  it('O cadastro de usuário a seguir NÃO deve funcionar pois o email já existe (caso alternativo)', () => {

    cy.visit(`${baseUrl}/cadastro`)
    cy.get('input[name="name"]').type('Rafael')
    cy.get('input[name="email"]').type('rafael@teste.com')
    cy.get('input[name="password"]').type('rafaelsenha')
    cy.get('input[name="confirmPassword"]').type('rafaelsenha') 
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/login')
  })
})