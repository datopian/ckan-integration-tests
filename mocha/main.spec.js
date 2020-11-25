import moch from "mocha";
import axios from "axios";
import fs from "fs";

import chai from "chai";

/**
 * TODO: Probably we need ckanClient and frictionless to be passed as an arguments in this test suite.
 * It's unclear what version should we test against? That's why I decided to install them in dev deps.
 * This needs to be clarified
 *  */
import * as ckanClient from "ckanClient";
import * as frictionless from "frictionless";
const Client = ckanClient.Client;
const open = frictionless.open;

const uuid = () => Math.random().toString(36).slice(2) + "_test";
// TODO: Probably we need to have a general config which will be usable for both Mocha and Cypress
const config = JSON.parse(fs.readFileSync("cypress.json"));

const sample = fs.readFileSync("./mocha/fixtures/sample.csv", "utf8");
const orgName = config.env.ORG_NAME_SUFFIX + uuid();
const packageName = uuid();

const headers = {
  authorization: config.env.API_KEY,
  "content-type": "application/json",
};

const client = new Client(
  config.env.API_KEY,
  orgName,
  packageName,
  config.baseUrl,
  config.env.GIFTLESS_URL
);

describe("CKAN Client can create resource and push blob", () => {
  before(async () => {
    // creates an organization to be the owner of test resources
    const a = await axios.post(
      `${config.baseUrl}/api/3/action/organization_create`,
      { name: orgName },
      { headers: headers }
    );
  });

  afterEach(async () => {
    // Delete the resource (if created)
    const {
      body,
    } = await axios.get(
      `${config.baseUrl}/api/3/action/package_show?name_or_id=${packageName}`,
      { headers }
    );

    await axios.post(
      `${config.baseUrl}/api/3/action/package_delete`,
      { id: body.result.id },
      { headers }
    );
  });

  it("CKAN Client: Create resource", async () => {
    // first, create the resource/package
    let dataset = await client.create({
      name: packageName,
      owner_org: orgName,
    });
    chai.expect(dataset.name).to.be.eq(packageName);

    const resource = open({ name: "sample.csv", data: sample });

    // ATTENTION! Next two lines is a hack, if don't do this the test fails
    // I've written this in order to make sure that we are able to test pushBlob() method.
    // We definitely should remove those two lines and raise in issue in datapub, this is
    // how is done there, which I think is hacky
    const hash = await resource.hash("sha256");
    resource.descriptor.hash = hash;

    // then push the blob
    const resp = await client.pushBlob(resource);
    expect(resp.success).to.be.eq(true);
  });

  after(async () => {
    // Delete the organization
    await axios.post(
      `${config.baseUrl}/api/3/action/organization_delete`,
      { id: orgName },
      { headers: headers }
    );
  });
});
