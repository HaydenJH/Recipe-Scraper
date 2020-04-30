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
            }
          } catch (e) {
            // Swallow error
          }
        });

        if (recipeSchemaRecipe == null) {
          reject(new Error("No recipe found on page"));
        }
        Recipe.image =
          recipeSchemaRecipe.image && Array.isArray(recipeSchemaRecipe.image)
            ? recipeSchemaRecipe.image[0]
            : null;
        Recipe.name = recipeSchemaRecipe.name;
        Recipe.servings = recipeSchemaRecipe.recipeYield;
        // todo parse these out "PT5M" -> minutes?
        Recipe.time.prep = recipeSchemaRecipe.prepTime;
        Recipe.time.cook = recipeSchemaRecipe.cookTime;

        Recipe.ingredients = recipeSchemaRecipe.recipeIngredient;
        Recipe.recipeCuisine = recipeSchemaRecipe.recipeCuisine;
        if (recipeSchemaRecipe.recipeInstructions) {
          recipeSchemaRecipe.recipeInstructions.forEach((ri) => {
            Recipe.instructions.push(ri.text);
          });
        }
        Recipe.aggregateRating = recipeSchemaRecipe.aggregateRating;
        delete Recipe.aggregateRating["@type"];
        if (
          !Recipe.name ||
          !Recipe.ingredients.length ||
          !Recipe.instructions.length
        ) {
          reject(new Error("No recipe found on page"));
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
