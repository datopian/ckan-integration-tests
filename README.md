# CKAN Integration Tests

This package uses [Cypress](https://www.cypress.io/) which is a JavaScript based end-to-end testing framework, and its BDD (Behaviour Driven Development) interface (`describe()`, `it()` etc.).

This package can be NPM-installed to automatize different test related to a CKAN platform.

Thanks to [Jari](https://github.com/Zharktas) for the effort in [converting core CKAN front-end tests to Cypress](https://github.com/ckan/ckan/tree/master/cypress).

## Install

Requires [NodeJS](https://nodejs.org) 13.2 or newer, with `npm`:

```console
$ npm install https://github.com/datopian/ckan-integration-tests
```

## Usage

Start with a regular Cypress repository, then:

1. Create a `test.js` file to wrap-up your Cypress call, for
   ```javascript
   import cypress from "cypress";
   import { CKANIntegrationTests } from "ckan-integration-tests";

   const assets = new CKANIntegrationTests();
   assets.addAllSpecs();

   cypress
     .run(assets.options)
     .then(console.log)
     .catch(console.error)
     .finally(() => assets.cleanUp());
   ```
1. Add `test.js` as your test script in the `package.json` (and make sure you are using ES modules):
   ```console
   {
       …
       "type": "module",
       "scripts": {
           …,
           "test": "node test.js"
       },
       …
   }
   ```
1. Copy `cypress.sample.json` as `cypress.json` and configure the CKAN URL, its front-end URL, user name, password and API key — for example:

   ```json
   {
     "chromeWebSecurity": false,
     "baseUrl": "https://ckan.myserver.org/",
     "pageLoadTimeout": 120000,
     "env": {
       "FRONTEND_URL": "https://ckan.myserver.org/",
       "API_KEY": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
       "CKAN_USERNAME": "joanne.doe",
       "CKAN_PASSWORD": "joannes-very-secret-password",
       "ORG_NAME_SUFFIX": "_organization_test",
       "DATASET_NAME_SUFFIX": "_dataset_test"
     }
   }
   ```

Now `npm test` will run:

* all the specs from your local Cypress repository
* plus all the one in this _CKAN Integration Tests_ package

Also, custom commands and fixtures from **both** repositories are available for your tests too.

## API

The example setup above includes basic tests for your CKAN application. You can run them all or select which ones make sense for your instance using  `CKANIntegrationTests.addSpecs` instead of `CKANIntegrationTests.addAllSpecs`.

### `CKANIntegrationTests.addSpec(source, specs)`

- `source` (_string_) is where this instance will start looking for test specs.
  Usually it is:
  - `"."` to load your own repository's specs,
  - or `CKANIntegrationTests.src` to load specs form this package<br>(`CKANIntegrationTests.src` is merely a shortcut for the path to the installation of this package and usually evaluates to `./node_modules/ckan-integration-tests`)
- `specs` (_string_ or an _array_ of _strings_) is **optional** and specifies which specs to load. For example:
  - `assets.addSpec(…, "ckan-classic-api")`
  - `assets.addSpec(…, ["ckan-classic-api"])`
  - `assets.addSpec(…, ["ckan-classic-api.spec.js", "ckan-classic-ui.spec.js"])`
    (the extensions `.js` and `.spec.js` are optional)

### `CKANIntegrationTests.addAllSpecs()`

Adds all test specs from this repository _and_ from your repository. It is a shortcut for:

```javascript
assets.addSpecs(assets.src);
assets.addSpecs(".");
```

### Import Tests as JavaScript Functions

Wrapped tests can be found in files (like `ckan-classic-ui-tests` and `ckan-datastore-tests`) into the `cypress/support/` directory. These JavaScript functions can be imported and used outside the `ckan-integration-tests` module.

Example:

```javascript
// cypress/support/ckan-datastore-tests.js

function createDatastoreTableNewResource(datasetName){
  it('Create a DataStore table with a new CKAN resource', () => {
    cy.get('#field-name').type(datasetName)
    cy.get('.btn-primary').click()
    ...
  })
}

module.exports.createDatastoreTableNewResource = createDatastoreTableNewResource;

```

Then in the spec, we can call the defined function:

```javascript
// cypress/integration/ckan-datastore.js

describe('CKAN DataStore Actions', () => {
  beforeEach(function () {
    cy.clearCookies()
    ...
  })
  afterEach(() => {
    ...
  })
  ...
  createDatastoreTableNewResource(datasetName)
  ...
})
```

Following the same principle, you can import the functions you want in your project set of tests.

```javascript
import { createDatastoreTableNewResource } from "ckan-integration-tests/cypress/support/ckan-datastore-tests"

describe('CKAN DataStore Actions', () => {
  beforeEach(function () {
    cy.clearCookies()
    ...
  })
  afterEach(() => {
    ...
  })
  ...
  createDatastoreTableNewResource(datasetName)
  ...
})
```

## Design

### Cypress

Cypress is a next-generation front end testing tool constructed for modern web applications. Most testing tools (like Selenium) operate by running outside of the browser and executing remote commands across the network. But the Cypress engine directly operates inside the browser. It enables Cypress to listen and modify the browser behavior at run time by manipulating DOM and altering Network requests and responses on the fly.

Check [Cypress's documentation](https://docs.cypress.io/guides/getting-started/writing-your-first-test.html) to learn more.

### Inheritance

Inheritance in Cypress is done using [commands](https://docs.cypress.io/api/cypress-api/custom-commands.html).

If a test requires a common thing such as `login`, `download file`, `register`. It should be added to the `commands.js` file. For example, the `login` in `cypress/support/commands.js` is a command used in different places.

_Commands are always loaded before any test runs._

As mentioned below in best practices please _make sure your tests are always isolate_ even if that means waiting a few extra seconds.

### Best Practices

- Don't share page state, test in isolation. Don't try to make global variables etc.
- Don't use selectors which are highly likely to change such as react id's rather use data attributes.
- Don't use the previous test result for granted for next result. If the login passes in previous test you should login again for the new test even if it takes slightly more time.
- Don't do things like `cy.wait(5000 seconds)` these are arbitrary and prone to failure depending on request and execution time.
- You can add the constants and files on `cypress/fixtures` — for example, the `cypress/fixtures/sample.csv` which can be used in commands and tests.

#### Non-browser based integration test

There is also a script to use [CKAN JavaScript client](https://github.com/datopian/ckan-client-js) to run in integration test:

```console
$ node ntegration_test_with_ckan_client.js <ORGANIZATION NAME>
```

This script requires a CKAN instance set with an organization.

In the future this script will be integrated into the Cypress set of test specs.
