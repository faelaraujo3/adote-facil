describe('Fluxo de Cadastro', () => {
  const baseUrl = 'http://localhost:3000'

  it('Deve permitir o cadastro de um novo usuário com confirmação de senha', () => {
    const emailUnico = `rafael_${Date.now()}@teste.com` // usando constante de email unico com data inclusa para evitar falha de teste por email já existente

    cy.visit(`${baseUrl}/cadastro`)
    cy.get('input[name="name"]').type('Rafael')
    cy.get('input[name="email"]').type(emailUnico)
    cy.get('input[name="password"]').type('rafaelsenha')
    // Preenche o campo de confirmação conforme o formulário real
    cy.get('input[name="confirmPassword"]').type('rafaelsenha') 
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/login')
  })
})