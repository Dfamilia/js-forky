import { elements } from "./base";

export const getInput = () => elements.searchInputDOM.value;

export const clearInput = () => {
  elements.searchInputDOM.value = "";
};

export const highlightSelected = (id) => {
  Array.from(document.querySelectorAll(".results__link")).forEach((e) => {
    e.classList.remove("results__link--active");
  });

  document
    .querySelector(`a[href="#${id}"]`)
    .classList.add("results__link--active");
};

export const clearResults = () => {
  elements.searchResultsListDOM.innerHTML = "";
  elements.searchResPages.innerHTML = "";
};

export const renderResults = (recipes, page = 1, resPerPage = 10) => {
  // render results of current page
  const start = (page - 1) * resPerPage; // 1) (1 - 1) * 10 = 0, 2) (2 - 1) * 10  = 10
  const end = page * resPerPage; // 1) 1 * 10 = 10, 2) 2 * 10 = 20

  // start=0, end=10, exclusive
  recipes.slice(start, end).forEach(renderRecipe);

  // render pagination button
  renderButtons(page, recipes.length, resPerPage);
};

const renderRecipe = (recipe) => {
  const markup = `
    <li>
        <a class="results__link" href="#${recipe.recipe_id}">
            <figure class="results__fig">
                <img src="${recipe.image_url}" alt="${recipe.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${limitRecipeTitle(recipe.title)}</h4>
                <p class="results__author">${recipe.publisher}</p>
            </div>
        </a>
    </li>

`;
  elements.searchResultsListDOM.insertAdjacentHTML("beforeend", markup);
};
/* 
    take a title and return a new title under de limit of words and add ... to the new title 
*/
const limitRecipeTitle = (title, limit = 17) => {
  const Title = [];
  if (title.length > limit) {
    title.split(" ").reduce((acc, cur) => {
      if (acc + cur.length <= limit) {
        Title.push(cur);
      }

      return acc + cur.length;
    }, 0);

    return `${Title.join(" ")} ...`;
  }
  return title;
};

// create pages per num of responses
const renderButtons = (page, numResults, resPerPage) => {
  const pages = Math.ceil(numResults / resPerPage);

  let button;
  if (page === 1 && pages > 1) {
    // Only button to go to next page
    button = createButton(page, "next");
  } else if (page < pages) {
    // Both buttons
    button = `
        ${createButton(page, "prev")}
        ${createButton(page, "next")}
    `;
  } else if (page === pages && pages > 1) {
    // Only button to go to prev page
    button = createButton(page, "prev");
  }

  elements.searchResPages.insertAdjacentHTML("afterbegin", button);
};

const createButton = (page, type) => `

    <button class="btn-inline results__btn--${type}" data-goto=${
  type === "prev" ? page - 1 : page + 1
}>
        <span>Page ${type === "prev" ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${
              type === "prev" ? "left" : "right"
            }"></use>
        </svg>
    </button>

`;
