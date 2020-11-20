// TODO implement this as a Cypress spec

import fs from "fs";
import ckan from "ckan-client";
import f11s from "frictionless.js";

const uuid = () => Math.random().toString(36).slice(2) + "_test";
const packageName = uuid();
const orgName = process.argv[2];
const config = JSON.parse(fs.readFileSync("cypress.json"));
const client = new ckan.Client(
  config.env.API_KEY,
  orgName,
  packageName,
  config.baseUrl,
  config.baseUrl + "/_giftless"
);

const run = async () => {
  const dataset = await client.create({
    name: packageName,
    owner_org: orgName,
  });
  const resource = f11s.open("cypress/fixtures/sample.csv");
  const resp = await client.pushBlob(resource);
  return resp;
};

run()
  .then(() => {
    console.log("OK");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FAIL");
    console.log(err);
    process.exit(1);
  });
