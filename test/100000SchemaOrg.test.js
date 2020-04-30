"use strict";
const commonRecipeTest = require("./helpers/commonRecipeTest");
const schemaOrg = require("../scrapers/schemaOrg");
const Constants = require("./constants/schemaOrgSiteConstants");

commonRecipeTest(
  "schema.org",
  schemaOrg,
  Constants,
  "skinnytaste.com"
);
