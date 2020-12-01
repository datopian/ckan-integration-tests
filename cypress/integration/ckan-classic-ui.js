import dotenv from 'dotenv'
import {
  createPackageFromUI,
  createResourceFromUI,
  uploadExcelFile,
  uploadPdfFile,
  uploadLargePdfFile,
  createOrganizationFromUI,
  subscribeUnsubscribeDataset,
} from '../support/ckan-classic-ui-tests'

const cypressUpload = require('cypress-file-upload')
const ckanUserName = Cypress.env('CKAN_USERNAME')
const ckanUserPassword = Cypress.env('CKAN_PASSWORD')

Cypress.on('uncaught:exception', (err, runnable) => {
  console.log(err)
  return false
})

describe('CKAN Classic UI', () => {
  beforeEach(function () {
    cy.clearCookies()
    cy.login(ckanUserName, ckanUserPassword)
  })

  createPackageFromUI()
  createResourceFromUI()
  uploadExcelFile()
  uploadPdfFile()
  uploadLargePdfFile()
  createOrganizationFromUI()
  subscribeUnsubscribeDataset()
})
