const ckanUserName = Cypress.env('CKAN_USERNAME')
const ckanUserPassword = Cypress.env('CKAN_PASSWORD')

describe('CKAN DataPusher', () => {
  beforeEach(function () {
    cy.clearCookies()
    cy.login(ckanUserName, ckanUserPassword)
  })

  it('should trigger DataPusher when new resource is created [upload]', () => {
    cy.createDataset().then((datasetName) => {
      cy.get('.dropdown-menu > :nth-child(3) > a').click({ force: true })
      cy.get('.page-header > .nav > :nth-child(2) > a').click()
      cy.get(':nth-child(1) > td').should('not.contain', 'Error')
      cy.get(':nth-child(2) > td').should('contain', 'Just now')
      // Now wait for 10s and check it has completed
      cy.wait(10000)
      cy.get('.nav > .active > a').click()
      cy.get(':nth-child(1) > td').should('not.contain', 'Error')
      cy.get(':nth-child(1) > td').should('contain', 'Complete')
      cy.deleteDataset(datasetName)
      cy.purgeDataset(datasetName)
    })
  })

  it('should trigger DataPusher when new resource is created [link]', () => {
    cy.createLinkedDataset().then((datasetName) => {
      cy.get('.dropdown-menu > :nth-child(3) > a').click({ force: true })
      cy.get('.page-header > .nav > :nth-child(2) > a').click()
      cy.get(':nth-child(1) > td').should('not.contain', 'Error')
      cy.get(':nth-child(2) > td').should('contain', 'Just now')
      // Now wait for 10s and check it has completed
      cy.wait(10000)
      cy.get('.nav > .active > a').click()
      cy.get(':nth-child(1) > td').should('not.contain', 'Error')
      cy.get(':nth-child(1) > td').should('contain', 'Complete')
      // Now resubmit (repush) it
      cy.get('.datapusher-form > .btn').click()
      cy.get(':nth-child(1) > td').should('contain', 'Pending')
      cy.get(':nth-child(2) > td').should('contain', 'Just now')
      cy.wait(10000)
      cy.get('.nav > .active > a').click()
      cy.get(':nth-child(1) > td').should('not.contain', 'Error')
      cy.get(':nth-child(1) > td').should('contain', 'Complete')
      cy.deleteDataset(datasetName)
      cy.purgeDataset(datasetName)
    })
  })
})
