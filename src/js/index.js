// Global app controller
import Search from "./Models/Search";
import Recipe from "./Models/Recipe";
import { elements, renderLoader, clearLoader } from "./Views/base";
import * as searchView from "./Views/searchView";
import * as recipeView from "./Views/recipeView";

/* Global state of the app
 * -- Search object
 * -- Current recipe object
 * -- Shopping list object
 * -- Liked recipes
 */
const state = {};

/*
 * Search Controller
 */
const controlSearch = async () => {
  // 1) Get query from view
  searchView.getInput();
  const query = searchView.getInput(); //TODO:

  if (query) {
    // 2) New search object and add to state
    state.search = new Search(query);

    // 3) Prepare UI for results
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchResultsDOM);
    try {
      // 4) Search for recipes
      await state.search.getResults();

      // 5) render results on UI
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (err) {
      alert("Something wrong with the search...");
    }
  }
};

elements.searchFormDOM.addEventListener("submit", (e) => {
  e.preventDefault();

  controlSearch();
});

elements.searchResPages.addEventListener("click", (e) => {
  // closest return the ancestor that your put on target
  const btn = e.target.closest(".btn-inline");

  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/*
 * Recipe Controller
 */

const controlRecipe = async () => {
  // Get ID from url
  const id = window.location.hash.replace("#", "");

  if (id) {
    //Prepare UI for changes
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // Highlight selector search item
    if (state.search) searchView.highlightSelected(id);

    // Create a new recipe object
    state.recipe = new Recipe(id);

    try {
      // Get recipe data and parse ingredients
      await state.recipe.getRecipe();
      console.log("without", state.recipe.ingredients);
      state.recipe.parseIngredients();
      console.log("with", state.recipe.ingredients);

      // Calculate serving and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (err) {
      console.log("Error processing recipe!!", err);
    }
  }
};

["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);
