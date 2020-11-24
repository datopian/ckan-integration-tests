import axios from "axios";
import fs from "fs";
import mocha from "mocha";
import chai from "chai";

const uuid = () => Math.random().toString(36).slice(2) + "_test";
const config = JSON.parse(fs.readFileSync("cypress.json"));
const orgName = config.env.ORG_NAME_SUFFIX + uuid();
const packageName = uuid(); // TODO unused so far (saved for later, for creating a resource)
const headers = {
  authorization: config.env.API_KEY,
  "content-type": "application/json"
};

describe("Test CKAN integration through CKAN client library", () => {
  before(async () => {
    // creates an organization to be the owner of test resources
    await axios.post(
      `${config.baseUrl}/api/3/action/organization_create`,
      { name: orgName },
      { headers: headers }
    );
  });

  after(async () => {
    // deletes the organization owner of test resources
    await axios.post(
      `${config.baseUrl}/api/3/action/organization_delete`,
      { id: orgName },
      { headers: headers }
    );
  });

  // TODO replace w/ meaningful test, this one is merely testing the before hook
  it("should list the test organization", async () => {
    const org = await axios.get(
      `${config.baseUrl}/api/3/action/organization_show?id=${orgName}`,
      { headers: headers }
    );
    chai.expect(org.success).to.be.eq(true);
  });
});