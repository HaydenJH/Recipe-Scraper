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
              parsed["@graph"].find((g) => g["@type"] === "Recipe")
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
        Recipe.image =
          recipeSchemaRecipe.image && Array.isArray(recipeSchemaRecipe.image)
            ? recipeSchemaRecipe.image[0]
            : recipeSchemaRecipe.image;
        Recipe.name = recipeSchemaRecipe.name;
        Recipe.servings = recipeSchemaRecipe.recipeYield;
        // todo parse these out "PT5M" -> minutes?
        Recipe.time.prep = recipeSchemaRecipe.prepTime;
        Recipe.time.cook = recipeSchemaRecipe.cookTime;

        Recipe.ingredients = recipeSchemaRecipe.recipeIngredient;
        Recipe.recipeCuisine = recipeSchemaRecipe.recipeCuisine;
        if (recipeSchemaRecipe.recipeInstructions) {
          if (Array.isArray(recipeSchemaRecipe.recipeInstructions)) {
            recipeSchemaRecipe.recipeInstructions.forEach((ri) => {
              if (typeof ri === "string") {
                Recipe.instructions.push(ri);
              }
              if (ri.text) {
                Recipe.instructions.push(ri.text);
              }
            });
          } else if (
            typeof recipeSchemaRecipe.recipeInstructions === "string"
          ) {
            Recipe.instructions.push(recipeSchemaRecipe.recipeInstructions);
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
          return reject(new Error("No recipe found on page"));
        } else {
          resolve(Recipe);
        }
      } else {
        reject(new Error("No recipe found on page"));
      }
    });
  });
};

module.exports = schemaOrg;
