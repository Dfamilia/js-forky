import Axios from "axios";

export default class Recipe {
  constructor(id) {
    this.id = id;
  }

  async getRecipe() {
    try {
      const res = await Axios(
        `https://forkify-api.herokuapp.com/api/get?rId=${this.id}`
      );
      this.title = res.data.recipe.title;
      this.author = res.data.recipe.publisher;
      this.img = res.data.recipe.image_url;
      this.url = res.data.recipe.source_url;
      this.ingredients = res.data.recipe.ingredients;
    } catch (err) {
      console.log(err);
      alert("Something went wrong!!");
    }
  }

  calcTime() {
    // Asuming that we need 15 min form each 3 ingredients
    const numIng = this.ingredients.length;
    const periods = Math.ceil(numIng / 3);
    this.time = periods * 15;
  }

  calcServings() {
    this.servings = 4;
  }

  // convert the all the ingredients to the short name
  parseIngredients() {
    const unitsLong = [
      "tablespoons",
      "tablespoon",
      "ounces",
      "ounce",
      "teaspoons",
      "teaspoon",
      "cups",
      "pounds",
    ];
    const unitsShort = [
      "tbsp",
      "tbsp",
      "oz",
      "oz",
      "tsp",
      "tsp",
      "cup",
      "pound",
    ];

    const units = [...unitsShort, "kg", "g"];

    const newIngredients = this.ingredients.map((el) => {
      // Uniform units
      let ingredient = el.toLowerCase();
      unitsLong.forEach((units, i) => {
        ingredient = ingredient.replace(units, unitsShort[i]);
      });

      //Remove parentheses
      //*** this regex delete search ( and ) parentesys to be replaced
      ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");

      // Parse ingredients into count, unit and ingredient
      const arrIng = ingredient.split(" ");
      //*** this find a element when we don't know what elements are lookin for
      const unitIndex = arrIng.findIndex((el2) => units.includes(el2));

      let objIng;
      if (unitIndex > -1) {
        //there is a unit
        const arrCount = arrIng.slice(0, unitIndex).filter((e) => e != "");

        let count;
        if (arrCount.length < 1) {
          count = 1;
        } else if (arrCount.length === 1) {
          count = eval(arrIng[0].replace("-", "+"));
        } else {
          // teacher option: count = eval(arrIng.slice(0, unitIndex).join("+"));
          count = eval(arrIng.slice(0, unitIndex).join("+"));
        }
        objIng = {
          count,
          unit: arrIng[unitIndex],
          ingredient: arrIng.slice(unitIndex + 1).join(" "),
        };
      } else if (parseInt(arrIng[0], 10)) {
        // there is NO unit, but 1st element is number
        objIng = {
          count: parseInt(arrIng[0], 10),
          unit: "",
          ingredient: arrIng.slice(1).join(" "),
        };
      } else if (unitIndex === -1) {
        // there NO unit and NO number on 1st element
        objIng = {
          count: 1,
          unit: "",
          ingredient,
        };
      }
      // return new ingredient of the current element of the new list
      return objIng;
    });

    this.ingredients = newIngredients;
  }

  updateServings(type) {
    //servings
    const newServings = type === "dec" ? this.servings - 1 : this.servings + 1;

    //Ingredients
    this.ingredients.forEach((ing) => {
      ing.count *= newServings / this.servings;
    });

    this.servings = newServings;
  }
}
