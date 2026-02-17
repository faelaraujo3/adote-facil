describe('Fluxo de Login - Sucesso', () => {
  const baseUrl = 'http://localhost:3000'

  it('Deve realizar login com sucesso e redirecionar para a vitrine de animais', () => {
    cy.visit(`${baseUrl}/login`)
    
    // Preenche com as credenciais CORRETAS cadastradas no teste de cadastro.cy.ts
    cy.get('input[name="email"]').type('rafael@teste.com')
    cy.get('input[name="password"]').type('rafaelsenha')
    
    cy.get('button[type="submit"]').click()
    
    // Verifica se o redirecionamento para a área logada aconteceu corretamente
    cy.url().should('include', '/area_logada/animais_disponiveis')
    
    // Verifica se elementos da área logada estão visíveis
    cy.get('aside').should('be.visible')
  })
})