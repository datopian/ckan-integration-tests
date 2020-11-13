const headers = {'Authorization': Cypress.env('API_KEY')}

module.exports.createDatastoreTableExistingResource = createDatastoreTableExistingResource;
module.exports.createDatastoreTableNewResource = createDatastoreTableNewResource;
module.exports.getTableInformation = getTableInformation
module.exports.upsertDatastoreTable = upsertDatastoreTable
module.exports.deleteDatastoreTable = deleteDatastoreTable

function createDatastoreTableExistingResource(datasetName){
  it('Create a DataStore table for existing CKAN resource + check datastore_search and datastore_search_sql endpoints', () => {
    cy.get('#field-name').type(datasetName)
    cy.get('.btn-primary').click()
    cy.location('pathname').should('eq', '/dataset/' + datasetName)
    cy.request({
      method: 'GET',
      url: '/api/3/action/package_show?id=' + datasetName,
      headers: headers
    }).then((response) => {
      expect(response.body.success).to.eq(true)
      const resourceId = response.body.result.resources[0].id
      const body = {
        resource_id: resourceId,
        force: true,
        fields: [
          {id: 'a'},
          {id: 'b'}
        ],
        records: [
          {a: 1, b: 'xyz'},
          {a: 2, b: 'zzz'}
        ]
      }
      cy.request({
        method: 'POST',
        url: '/api/3/action/datastore_create',
        headers: headers,
        body: body
      }).then((response) => {
        expect(response.body.success).to.eq(true)
        // Check 'datastore_search' endpoint
        cy.request({
          method: 'GET',
          url: '/api/3/action/datastore_search?resource_id=' + resourceId,
          headers: headers
        }).then((response) => {
          expect(response.body.success).to.eq(true)
          expect(response.body.result.total).to.eq(2)
        })
        // Check 'datastore_search_sql' endpoint
        cy.request({
          method: 'GET',
          url: `/api/3/action/datastore_search_sql?sql=SELECT * FROM "${resourceId}"`,
          headers: headers
        }).then((response) => {
          expect(response.body.success).to.eq(true)
          expect(response.body.result.records.length).to.eq(2)
        })
      })
    })
  })
}

function createDatastoreTableNewResource(datasetName){
  it('Create a DataStore table with a new CKAN resource', () => {
    cy.get('#field-name').type(datasetName)
    cy.get('.btn-primary').click()
    cy.location('pathname').should('eq', '/dataset/' + datasetName)
    const body = {
      resource: {
        package_id: datasetName,
        name: datasetName + '-datastore'
      },
      fields: [
        {id: 'a'},
        {id: 'b'}
      ],
      records: [
        {a: 1, b: 'xyz'},
        {a: 2, b: 'zzz'}
      ]
    }
    cy.request({
      method: 'POST',
      url: '/api/3/action/datastore_create',
      headers: headers,
      body: body
    }).then((response) => {
      expect(response.body.success).to.eq(true)
      cy.request({
        method: 'GET',
        url: '/api/3/action/package_show?id=' + datasetName,
        headers: headers
      }).then((response) => {
        expect(response.body.success).to.eq(true)
        const resourceId = response.body.result.resources
          .find(item => item.name === datasetName + '-datastore')
          .id
        cy.request({
          method: 'GET',
          url: '/api/3/action/datastore_search?resource_id=' + resourceId,
          headers: headers
        }).then((response) => {
          expect(response.body.success).to.eq(true)
          expect(response.body.result.total).to.eq(2)
        })
      })
    })
  })
}

function getTableInformation() {
  it('Get information about tables and aliases in DataStore', () => {
    cy.request({url: '/api/3/action/datastore_search?resource_id=_table_metadata'}).then((resp) => {
      expect(resp.body.success).to.eq(true)
    })
  })
}

function upsertDatastoreTable(datasetName) {
  it('Upsert to datastore table', () => {
    cy.get('#field-name').type(datasetName)
    cy.get('.btn-primary').click()
    cy.location('pathname').should('eq', '/dataset/' + datasetName)
    cy.request({
      method: 'GET',
      url: '/api/3/action/package_show?id=' + datasetName,
      headers: headers
    }).then((response) => {
      expect(response.body.success).to.eq(true)
      const resourceId = response.body.result.resources[0].id
      const body = {
        resource_id: resourceId,
        force: true,
        fields: [
          {id: 'a', type: 'int'},
          {id: 'b', type: 'text'}
        ]
      }
      cy.request({
        method: 'POST',
        url: '/api/3/action/datastore_create',
        headers: headers,
        body: body
      }).then((response) => {
        expect(response.body.success).to.eq(true)
        cy.request({
          method: 'GET',
          url: '/api/3/action/datastore_search?resource_id=' + resourceId,
          headers: headers
        }).then((response) => {
          expect(response.body.success).to.eq(true)
          expect(response.body.result.total).to.eq(0)
          // Now upsert some data
          const body = {
            resource_id: resourceId,
            force: true,
            records: [
              {a: 1, b: 'xyz'},
              {a: 2, b: 'zzz'}
            ],
            method: 'insert'
          }
          cy.request({
            method: 'POST',
            url: '/api/3/action/datastore_upsert',
            headers: headers,
            body: body
          }).then((response) => {
            expect(response.body.success).to.eq(true)
            cy.request({
              method: 'GET',
              url: '/api/3/action/datastore_search?resource_id=' + resourceId,
              headers: headers
            }).then((response) => {
              expect(response.body.success).to.eq(true)
              expect(response.body.result.total).to.eq(2)
            })
          })
        })
      })
    })
  })
}

function deleteDatastoreTable(datasetName) {
  it('Delete a table from datastore', () => {
    cy.get('#field-name').type(datasetName)
    cy.get('.btn-primary').click()
    cy.location('pathname').should('eq', '/dataset/' + datasetName)
    cy.request({
      method: 'GET',
      url: '/api/3/action/package_show?id=' + datasetName,
      headers: headers
    }).then((response) => {
      expect(response.body.success).to.eq(true)
      const resourceId = response.body.result.resources[0].id
      const body = {
        resource_id: resourceId,
        force: true,
        fields: [
          {id: 'a', type: 'int'},
          {id: 'b', type: 'text'}
        ]
      }
      cy.request({
        method: 'POST',
        url: '/api/3/action/datastore_create',
        headers: headers,
        body: body
      }).then((response) => {
        expect(response.body.success).to.eq(true)
        // Now delete it
        cy.request({
          method: 'POST',
          url: '/api/3/action/datastore_delete',
          headers: headers,
          body: {
            resource_id: resourceId,
            force: true
          }
        }).then((response) => {
          expect(response.body.success).to.eq(true)
        })
      })
    })
  })
}