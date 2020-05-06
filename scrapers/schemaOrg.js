const request = require("request");
const cheerio = require("cheerio");

const RecipeSchema = require("../helpers/recipe-schema");

const schemaOrg = (url) => {
  const Recipe = new RecipeSchema();
  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      if (!error && response.statusCode === 200) {
        const $ = cheerio.load(html);

        let recipeSchemaRecipe = null;
        let scripts = $('script[type="application/ld+json"]');

        scripts.each((i, el) => {
          try {
            let parsed = JSON.parse($(el).html());
            if (parsed && parsed["@type"] && parsed["@type"] === "Recipe") {
              recipeSchemaRecipe = parsed;
              return false;
            } else if (
              parsed &&
              parsed["@graph"] &&
              Array.isArray(parsed["@graph"]) &&
              parsed["@graph"].find((g) => g["@type"] === "Recipe") != null
            ) {
              recipeSchemaRecipe = parsed["@graph"].find(
                (g) => g["@type"] === "Recipe"
              );
              return false;
            } else if (
              parsed &&
              Array.isArray(parsed) &&
              parsed.find((p) => p["@type"] === "Recipe")
            ) {
              recipeSchemaRecipe = parsed.find((p) => p["@type"] === "Recipe");
            }
          } catch (e) {
            // Swallow error
          }
        });

        if (recipeSchemaRecipe == null) {
          return reject(new Error("No recipe found on page"));
        }
        if (recipeSchemaRecipe.image) {
          if (Array.isArray(recipeSchemaRecipe.image)) {
            Recipe.image = recipeSchemaRecipe.image[0];
          } else if (recipeSchemaRecipe.image.url) {
            Recipe.image = recipeSchemaRecipe.image.url;
          } else {
            Recipe.image = recipeSchemaRecipe.image;
          }
        }

        Recipe.nutrition = recipeSchemaRecipe.nutrition;
        Recipe.name = recipeSchemaRecipe.name;
        Recipe.servings = recipeSchemaRecipe.recipeYield;
        // todo parse these out "PT5M" -> minutes?
        Recipe.time.prep = recipeSchemaRecipe.prepTime;
        Recipe.time.cook = recipeSchemaRecipe.cookTime;

        Recipe.ingredients = recipeSchemaRecipe.recipeIngredient;
        if (recipeSchemaRecipe.recipeCuisine) {
          if (Array.isArray(recipeSchemaRecipe.recipeCuisine)) {
            Recipe.recipeCuisine = recipeSchemaRecipe.recipeCuisine;
          } else if (typeof recipeSchemaRecipe.recipeCuisine === "string") {
            Recipe.recipeCuisine.push(recipeSchemaRecipe.recipeCuisine);
          }
        }
        if (recipeSchemaRecipe.recipeInstructions) {
          if (Array.isArray(recipeSchemaRecipe.recipeInstructions)) {
            if (
              recipeSchemaRecipe.recipeInstructions.some(
                (ri) => ri.itemListElement && Array.isArray(ri.itemListElement)
              )
            ) {
              recipeSchemaRecipe.recipeInstructions.forEach((ri) => {
                if (ri.itemListElement && Array.isArray(ri.itemListElement)) {
                  ri.itemListElement.forEach((ile) => {
                    Recipe.instructions.push(ile.text);
                  });
                }
              });
            } else {
              recipeSchemaRecipe.recipeInstructions.forEach((ri) => {
                if (typeof ri === "string") {
                  Recipe.instructions.push(ri);
                }
                if (ri.text) {
                  Recipe.instructions.push(ri.text);
                }
              });
            }
          } else if (
            typeof recipeSchemaRecipe.recipeInstructions === "string"
          ) {
            Recipe.instructions.push(recipeSchemaRecipe.recipeInstructions);
          }
        }

        if (recipeSchemaRecipe.recipeCategory) {
          if (Array.isArray(recipeSchemaRecipe.recipeCategory)) {
            Recipe.recipeCategory = recipeSchemaRecipe.recipeCategory;
          } else if (typeof recipeSchemaRecipe.recipeCategory === "string") {
            Recipe.recipeCategory.push(recipeSchemaRecipe.recipeCategory);
          }
        }

        Recipe.aggregateRating = recipeSchemaRecipe.aggregateRating;
        if (Recipe.aggregateRating) {
          delete Recipe.aggregateRating["@type"];
        }
        if (
          !Recipe.name ||
          !Recipe.ingredients.length ||
          !Recipe.instructions.length
        ) {
          console.error(
            `Recipe had no name, ingredients or instructions.  Recipe: ${Recipe}`
          );
          return reject(new Error("No recipe found on page"));
        } else {
          resolve(Recipe);
        }
      } else {
        console.error(`Failed to load page at url: ${url}`);
        reject(new Error("Failed to load page"));
      }
    });
  });
};

module.exports = schemaOrg;
