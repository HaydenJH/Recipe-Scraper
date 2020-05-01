function Recipe() {
  this.name = "";
  this.ingredients = [];
  this.instructions = [];
  this.time = {
    prep: "",
    cook: "",
    active: "",
    inactive: "",
    ready: "",
    total: "",
  };
  this.servings = "";
  this.image = "";
  this.aggregateRating = null;
  this.recipeCuisine = [];
  this.recipeCategory = [];
  this.nutrition = null;
}

module.exports = Recipe;
