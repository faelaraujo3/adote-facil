describe('Fluxo de Gerenciamento de Animais', () => {
  const baseUrl = 'http://localhost:3000'

  // Ignora o erro de hidratação do React para não travar o teste
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('Minified React error #418') || err.message.includes('hydration')) {
      return false
    }
  })

  it('Deve permitir cadastrar um animal após estar logado', () => {
    cy.visit(`${baseUrl}/login`)
    cy.get('input[name="email"]').type('rafael@teste.com')
    cy.get('input[name="password"]').type('rafaelsenha')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/area_logada/animais_disponiveis')

    cy.visit(`${baseUrl}/area_logada/disponibilizar_animal`)
    cy.wait(500) 

    cy.get('input[name="name"]').should('be.visible').type('Bob', { force: true })

    cy.contains('Selecione um tipo').click({ force: true })
    
    cy.get('[role="option"]').contains('Gato').click({ force: true })

    cy.contains('Selecione um gênero').click({ force: true })
    cy.get('[role="option"]').contains('Macho').click({ force: true })

    cy.get('input[name="race"]').type('Siamês', { force: true })
    cy.get('textarea[name="description"]').type('Gato dócil e vacinado.', { force: true })
    
    // NAO envia foto! (ERRO PREVISTO)

    cy.get('button[type="submit"]').click({ force: true })

    cy.url().should('include', '/area_logada/meus_animais')
    cy.contains('Bob').should('be.visible')  })
})