describe('Cypress simulator', () => {
  beforeEach(() => {
    cy.visit('./src/index.html?skipCaptcha=true', {
      onBeforeLoad(win) {
        win.localStorage.setItem("cookieConsent", "accepted")
      }
    })
    cy.contains('button', 'Login').click();
  });
  it(`Success: valid cypress command`, () => {
    cy.get('#codeInput')
      .type('cy.log("Yay!")')

    cy.get('#runButton')
      .click();

    cy.get('#outputArea', { timeout: 6000 })
      .should('contain', 'Success:')
      .and('contain', 'cy.log("Yay!") // Logged message "Yay!"')
      .and('be.visible')
  })

  it('Error: invalid cypress command ', () => {
    cy.get('#codeInput')
      .type('cy.run()')

    cy.get('#runButton')
      .click();

    cy.get('#outputArea', { timeout: 6000 })
      .should('contain', 'Error:')
      .and('contain', 'Invalid Cypress command: cy.run()')
      .and('be.visible')
  });

  it('Warning: Cypress command not implemented', () => {
    cy.get('#codeInput')
      .type('cy.contains("Login")')

    cy.get('#runButton')
      .click();

    cy.get('#outputArea', { timeout: 7000 })
      .should('contain', 'Warning:')
      .and('contain', 'The `cy.contains` command has not been implemented yet.')
      .and('be.visible')
  });

  it('Error: valid command withou parentheses', () => {
    cy.get('#codeInput')
      .type('cy.visit')

    cy.get('#runButton')
      .click();

    cy.get('#outputArea', { timeout: 6000 })
      .should('contain', 'Error:')
      .and('contain', 'Missing parentheses on `cy.visit` command')
      .and('be.visible')
  });

  it('Help command', () => {
    cy.get('#codeInput')
      .type('help')

    cy.get('#runButton')
      .click();

    cy.get('#outputArea', { timeout: 6000 })
      .should('contain', 'Common Cypress commands and examples:')
      .and('contain', 'For more commands and details, visit the official Cypress API documentation.')
      .and('be.visible')

    cy.get('#outputArea')
      .find('a')
      .should('contain', 'official Cypress API documentation')
      .and('have.attr', 'href', 'https://docs.cypress.io/api/table-of-contents')
      .and('have.attr', 'target', '_blank')
      .and('have.attr', 'rel', 'noopener noreferrer')
      .and('be.visible')
  });


  it('maximizes and minimizes a simulation results', () => {
    cy.get('#codeInput')
      .type('cy.log("Yay!")')
    cy.get('#runButton')
      .click();

    cy.get('.expand-collapse').click()

    cy.get('#outputArea', { timeout: 6000 })
      .should('contain', 'Success')
      .and('contain', 'cy.log("Yay!") // Logged message "Yay!"')
      .and('be.visible')
    cy.get('#collapseIcon').should('be.visible')

    cy.get('.expand-collapse').click()
    cy.get('#expandIcon').should('be.visible')
  });

  it('logout successfully', () => {
    cy.get('#sandwich-menu').click()
    cy.get('#logoutButton').click()

    cy.get('#login').should('be.visible')
      .and("contain", "Let's get started!")

    cy.get('#sandwich-menu').should('not.be.visible')

  });

  it('Show and hide logout button', () => {
    cy.get('#sandwich-menu').click()
    cy.get('#logoutButton').should('be.visible')

    cy.get('#sandwich-menu').click()
    cy.get('#logoutButton').should('not.be.visible')
  });

  it('shows the running state before showing the final result', () => {
    cy.get('#codeInput').type('cy.log("Yay!")')
    cy.get('#runButton').click();

    cy.get('.loading').should('be.visible')
    cy.get('#outputArea').should('contain', 'Running... Please wait.')
      .and('be.visible')

    cy.get('.loading', { timeout: 6000 }).should('not.exist')

    cy.get('#outputArea')
      .should('contain', 'Success:')
      .and('contain', 'cy.log("Yay!") // Logged message "Yay!"')
      .and('be.visible')
  });

  it('checks the run button disabled and enabled states', () => {
    cy.get('#runButton').should('be.disabled')

    cy.get('#codeInput').type('cy.log("Yay!")')
    cy.get('#runButton').should('be.enabled')

    cy.get('#codeInput').clear()
    cy.get('#runButton').should('be.disabled')
  });

  it('clears the code input when logging off then logging in again', () => {
    cy.get('#codeInput').type('cy.log("Yay!")')
    cy.get('#sandwich-menu').click()
    cy.get('#logoutButton').click()
    cy.contains('button', 'Login').click();

    cy.get('#codeInput').should('have.value', '')
      .and('be.visible')
  });

  it('disables the run button when logging off then logging in again', () => {
    cy.get('#codeInput').type('cy.log("Yay!")')
    cy.get('#sandwich-menu').click()
    cy.get('#logoutButton').click()
    cy.contains('button', 'Login').click();

    cy.get('#codeInput').should('have.value', '')
    cy.get('#runButton').should('be.disabled')
      .and('be.visible')
  });

  it('clears the code output when logging off then logging in again', () => {
    cy.get('#codeInput').type('cy.log("Yay!")')
    cy.get('#runButton').click();

    cy.get('#outputArea', { timeout: 6000 })
      .should('contain', 'Success:')
      .and('contain', 'cy.log("Yay!") // Logged message "Yay!"')
      .and('be.visible')

    cy.get('#sandwich-menu').click()
    cy.get('#logoutButton').click()
    cy.contains('button', 'Login').click();

    cy.get('#outputArea').should('have.value', '')
      .and('not.contain', 'cy.log("Yay!")')
  });

  it('doesnt show the cookie consent banner on the login page', () => {
    cy.clearAllLocalStorage()

    cy.reload()

    cy.contains('button', 'Login').should('be.visible')
    cy.get('#cookieConsent').should('not.be.visible')
  });
})

describe('Cypress simulator - Cookies consent', () => {
  beforeEach(() => {
    cy.visit('./src/index.html?skipCaptcha=true')
    cy.contains('button', 'Login').click()
  });

  it('consents on the cookies usage', () => {
    cy.get('#cookieConsent')
      .as('cookieConsentBanner')
      .find('button:contains("Accept")')
      .click()

    cy.get('@cookieConsentBanner').should('not.be.visible')
    cy.window()
      .its('localStorage.cookieConsent')
      .should('be.equal', 'accepted')
  });

  it('it declines on the cookies usage', () => {
    cy.get('#cookieConsent')
      .as('cookieConsentBanner')
      .find('button:contains("Decline")')
      .click()

    cy.get('@cookieConsentBanner').should('not.be.visible')
    cy.window()
      .its('localStorage.cookieConsent')
      .should('be.equal', 'declined')
  });

});

describe('Cypress simulator - Captcha', () => {
  beforeEach(() => {
    cy.visit('./src/index.html')
    cy.contains('button', 'Login').click()
  });

  it('disables the captcha verify button when no answer is provided or its cleared', () => {
    cy.get('#verifyCaptcha').should('be.disabled')

    cy.get('#captchaInput').type('5')
    cy.get('#verifyCaptcha').should('be.enabled')

    cy.get('#captchaInput').clear()
    cy.get('#verifyCaptcha').should('be.disabled')
  });

  it('shows an error on a wrong captcha answer and goes back to its initial state', () => {
    cy.get('#captchaInput').type('100000000000')
    cy.get('#verifyCaptcha').click()

    cy.get('#captchaError').should('be.visible')
      .and('contain', 'Incorrect answer, please try again.')
    cy.get('#captchaInput').should('have.value', '')
    cy.get('#verifyCaptcha').should('be.disabled')
  });
});
