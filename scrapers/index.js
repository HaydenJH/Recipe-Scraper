const parseDomain = require("parse-domain");
const schemaOrg = require("./schemaOrg");

const domains = {
  "101cookbooks": require("./101cookbooks"),
  allrecipes: require("./allrecipes"),
  ambitiouskitchen: require("./ambitiouskitchen"),
  bbc: require("./bbc"),
  bbcgoodfood: require("./bbcgoodfood"),
  bonappetit: require("./bonappetit"),
  budgetbytes: require("./budgetbytes"),
  closetcooking: require("./closetcooking"),
  cookieandkate: require("./cookieandkate"),
  copykat: require("./copykat"),
  damndelicious: require("./damndelicious"),
  eatingwell: require("./eatingwell"),
  epicurious: require("./epicurious"),
  finecooking: require("./finecooking"),
  food: require("./food"),
  foodandwine: require("./foodandwine"),
  foodnetwork: require("./foodnetwork"),
  gimmesomeoven: require("./gimmesomeoven"),
  kitchenstories: require("./kitchenstories"),
  myrecipes: require("./myrecipes"),
  seriouseats: require("./seriouseats"),
  simplyrecipes: require("./simplyrecipes"),
  smittenkitchen: require("./smittenkitchen"),
  thepioneerwoman: require("./thepioneerwoman"),
  therealfoodrds: require("./therealfoodrds"),
  thespruceeats: require("./thespruceeats"),
  whatsgabycooking: require("./whatsgabycooking"),
  woolworths: require("./woolworths.js"),
  yummly: require("./yummly"),
};

const recipeScraper = (url) => {
  let domain = parseDomain(url).domain;
  return new Promise((resolve, reject) => {
    // First try parse the schema.org schema
    schemaOrg(url).then(
      (recipe) => {
        resolve(recipe);
      },
      () => {
        // Fall back to specific scraper
        if (domains[domain] !== undefined) {
          return resolve(domains[domain](url));
        } else {
          return reject(new Error("Site not yet supported"));
        }
      }
    );
  });
};

module.exports = recipeScraper;
