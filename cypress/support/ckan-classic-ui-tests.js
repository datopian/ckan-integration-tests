module.exports.createPackageFromUI = createPackageFromUI;
module.exports.createResourceFromUI = createResourceFromUI;
module.exports.uploadExcelFile = uploadExcelFile;
module.exports.uploadPdfFile = uploadPdfFile;
module.exports.uploadLargePdfFile = uploadLargePdfFile;
module.exports.createOrganizationFromUI = createOrganizationFromUI;
//module.exports.subscribeUnsubscribeDataset = subscribeUnsubscribeDataset;

function createPackageFromUI() {
  it('Creating a new package from the UI', () => {
    cy.createDataset().then((datasetName) => {
      cy.location('pathname').should('eq', '/dataset/' + datasetName)
      cy.deleteDataset(datasetName)
      cy.purgeDataset(datasetName)
    })
  })
}
  
function createResourceFromUI() {
  it('Adding a new resource from the UI', () => {
    cy.createDataset().then((datasetName) => {
      cy.get('.content_action > .btn').click()
      cy.get('.page-header > .nav > :nth-child(2) > a').click()
      cy.get('.page_primary_action > .btn:first-child').click()
      cy.get('#field-image-upload').attachFile({ filePath: 'sample2.csv', fileName: 'sample2.csv' })
      cy.get('#field-name').type('sample2')
      cy.get('button.btn-primary').click()
      cy.contains('sample2')
      cy.deleteDataset(datasetName)
      cy.purgeDataset(datasetName)
    })
  })
}
  
function uploadExcelFile() {
  it('Uploads Excel file and creates a preview (data explorer)', () => {
    cy.createDatasetWithoutFile().then((datasetName) => {
      cy.get('#field-image-upload').attachFile({ filePath: 'sample.xlsx', fileName: 'sample.xlsx' })
      cy.get('#field-name').type('sample xlsx')
      cy.get('#select2-chosen-1').type('XLSX{enter}')
      cy.scrollTo('bottom')
      cy.get('button.btn-primary[type=submit]').click({force: true})
      cy.get('.resource-item > .heading').click()
      cy.get('.module-content > .nav > .active > a').contains('Data Explorer')
      cy.deleteDataset(datasetName)
      cy.purgeDataset(datasetName)
    })
  })
}
  
function uploadPdfFile() {
  it('Upload PDF', () => {
    cy.createDatasetWithoutFile().then((datasetName) => {
      cy.get('#field-image-upload').attachFile({ filePath: 'sample-pdf-with-images.pdf', fileName: 'sample-pdf-with-images.pdf' })
      cy.get('button.btn-primary').click()
      cy.location('pathname').should('eq', '/dataset/' + datasetName)
      cy.get('.resource-item > .heading').click()
      cy.deleteDataset(datasetName)
      cy.purgeDataset(datasetName)
    })
  })
}
  
function uploadLargePdfFile() {
  it('Upload large PDF', () => {
    cy.createDatasetWithoutFile().then((datasetName) => {
      cy.get('#field-image-upload').attachFile({ filePath: 'sample-pdf-large-size.pdf', fileName: 'sample-pdf-large-size.pdf' })
      cy.get('button.btn-primary').click()
      cy.location('pathname').should('eq', '/dataset/' + datasetName)
      cy.deleteDataset(datasetName)
      cy.purgeDataset(datasetName)
    })
  })
}
  
function createOrganizationFromUI() {
  it('Adding a new organization from the UI', () => {
    cy.createOrganization().then((orgName) => {
      cy.deleteOrganization(orgName)
    })
  })
}
  
/* function subscribeUnsubscribeDataset() {
  it('Make a dataset subscribable and then unsubscribable', () => {
    cy.createDataset().then((datasetName) => {
      cy.location('pathname').should('eq', '/dataset/' + datasetName)
      cy.get('.content_action > .btn').click()
      cy.get('.select2-choices').type('subscribable{enter}')
      cy.get('.btn-primary').click()
      cy.get('.tag-list').contains('subscribable')
      // TODO make it unsubscribable
      // cy.visit('/dataset/' + datasetName)
      // cy.get('.content_action > .btn').click()
      // cy.get('.select2-search-choice > .select2-search-choice-close').click()
      // cy.get('.btn-primary').click()

      cy.deleteDataset(datasetName)
      cy.purgeDataset(datasetName)
    })
  })
} */
  