// Global app controller
import Search from "./Models/Search";
import Recipe from "./Models/Recipe";
import List from "./Models/List";
import Likes from "./Models/Likes";
import { elements, renderLoader, clearLoader } from "./Views/base";
import * as searchView from "./Views/searchView";
import * as recipeView from "./Views/recipeView";
import * as listView from "./Views/listView";
import * as likesView from "./Views/likesView";

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
  const query = searchView.getInput();

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
      state.recipe.parseIngredients();

      // Calculate serving and time
      state.recipe.calcTime();
      state.recipe.calcServings();

      // Render recipe
      clearLoader();
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
    } catch (err) {
      console.log("Error processing recipe!!", err);
    }
  }
};

["hashchange", "load"].forEach((event) =>
  window.addEventListener(event, controlRecipe)
);

/*
 * List Controller
 */
const controlList = () => {
  // Create a new ingredient to the list and UI
  if (!state.list) state.list = new List();

  // Add each ingredient to the list and UI
  state.recipe.ingredients.forEach((el) => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

/*
 * Like Controller
 */

const controlLike = () => {
  if (!state.likes) state.likes = new Likes();
  const currentID = state.recipe.id;

  // User has NOT yet liked current recipe
  if (!state.likes.isLiked(currentID)) {
    // Add like to the state
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );
    // Toggle the like button
    likesView.toggleLikeBtn(true);
    // Add like to UI list
    likesView.renderLike(newLike);

    // User HAS yet liked current recipe
  } else {
    // Remove like to the state
    state.likes.deleteLike(currentID);
    // Toggle the like button
    likesView.toggleLikeBtn(false);
    // Remove like to UI list
    likesView.deleteLike(currentID);
  }

  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// Restore liked recipes on page reload

window.addEventListener("load", () => {
  state.likes = new Likes();

  // Restore likes
  state.likes.readStorage();

  // Toggle like menu button
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  // Render  existin likes
  state.likes.likes.forEach((like) => likesView.renderLike(like));
});

// Handling delete and update list item events
elements.shopping.addEventListener("click", (e) => {
  const id = e.target.closest(".shopping__item").dataset.itemid;

  // Handle the delete button
  if (e.target.matches(".shopping__delete, .shopping__delete *")) {
    // Delete from state
    state.list.removeItem(id);

    // Delete from UI
    listView.deleteItem(id);

    // Handle de count update
  } else if (e.target.matches(".shopping__count--value")) {
    const val = parseFloat(e.target.value, 10);
    state.list.updateCount(id, val);
  }
});

// Handling recipe button clicks
elements.recipe.addEventListener("click", (e) => {
  // matches with btn-decrease or btn-decrease and its childs
  if (e.target.matches(".btn-decrease, .btn-decrease *")) {
    // Decrease button was clicked
    if (state.recipe.servings > 1) {
      state.recipe.updateServings("dec");
      recipeView.updateSevingsIngredients(state.recipe);
    }
  } else if (e.target.matches(".btn-increase, .btn-increase *")) {
    // Increase button was clicked
    state.recipe.updateServings("inc");
    recipeView.updateSevingsIngredients(state.recipe);
  } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
    controlList();
  } else if (e.target.matches(".recipe__love, .recipe__love *")) {
    controlLike();
  }
});
