import {
  createDatastoreTableExistingResource,
  createDatastoreTableNewResource,
  getTableInformation,
  upsertDatastoreTable,
  deleteDatastoreTable,
} from '../support/ckan-datastore-tests'

const headers = { Authorization: Cypress.env('API_KEY') }
const ckanUserName = Cypress.env('CKAN_USERNAME')
const ckanUserPassword = Cypress.env('CKAN_PASSWORD')

const getRandomDatasetName = () =>
  Math.random().toString(36).slice(2) + Cypress.env('DATASET_NAME_SUFFIX')
const datasetName = getRandomDatasetName()

describe('CKAN DataStore Actions', () => {
  beforeEach(function () {
    cy.clearCookies()
    cy.login(ckanUserName, ckanUserPassword)
    cy.createDatasetWithoutFile(datasetName)
  })

  afterEach(() => {
    cy.request({
      method: 'POST',
      url: '/api/3/action/dataset_purge',
      headers: headers,
      body: { id: datasetName },
    })
  })

  createDatastoreTableExistingResource(datasetName)
  createDatastoreTableNewResource(datasetName)
  getTableInformation()
  upsertDatastoreTable(datasetName)
  deleteDatastoreTable(datasetName)
})
