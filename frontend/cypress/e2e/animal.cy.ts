describe('Fluxo de Gerenciamento de Animais', () => {
  const baseUrl = 'http://localhost:3000'

  // Ignora o erro de hidratação do React pra não travar o teste
  Cypress.on('uncaught:exception', (err) => {
    if (err.message.includes('Minified React error #418') || err.message.includes('hydration')) {
      return false
    }
  })

  it('Deve permitir cadastrar um animal após estar logado', () => {
    // Faz login
    cy.visit(`${baseUrl}/login`)
    cy.get('input[name="email"]').type('rafael@teste.com')
    cy.get('input[name="password"]').type('rafaelsenha')
    cy.get('button[type="submit"]').click()

    cy.url().should('include', '/area_logada/animais_disponiveis')

    // Navega para a página de cadastro
    cy.visit(`${baseUrl}/area_logada/disponibilizar_animal`)
    cy.wait(500) // tempo pra estabilizar (necessário por causa do react)

    // Inclui nome
    cy.get('input[name="name"]').should('be.visible').type('Billy', { force: true })

    // Selecionando tipo
    cy.contains('Selecione um tipo').click({ force: true })
    
    cy.get('[role="option"]').contains('Cachorro').click({ force: true })

    // Gênero
    cy.contains('Selecione um gênero').click({ force: true })
    cy.get('[role="option"]').contains('Macho').click({ force: true })

    // raça e descrição
    cy.get('input[name="race"]').type('Vira-lata', { force: true })
    cy.get('textarea[name="description"]').type('Cão dócil e vacinado.', { force: true })
    
    // Upload de foto na pasta fixtures
    cy.get('input#animalPictures').selectFile('cypress/fixtures/cachorroimagem.jpg', { force: true })
    cy.get('img[alt="animal picture"]').should('be.visible')

    // envia
    cy.get('button[type="submit"]').click({ force: true })

    // verifica se o animal foi cadastrado
    cy.url().should('include', '/area_logada/meus_animais')
    cy.contains('Billy').should('be.visible')  })
})