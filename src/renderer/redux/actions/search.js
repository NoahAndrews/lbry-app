import * as actions from "constants/action_types";
import lbryuri from "lbryuri";
import { doResolveUri } from "redux/actions/content";
import { doNavigate } from "redux/actions/navigation";
import { selectCurrentPage } from "redux/selectors/navigation";
import batchActions from "util/batchActions";

const handleResponse = response => {
  return response.status === 200
    ? Promise.resolve(response.json())
    : Promise.reject(new Error(response.statusText));
};

export function doSearch(rawQuery) {
  return function(dispatch, getState) {
    const state = getState();
    const page = selectCurrentPage(state);

    const query = rawQuery.replace(/^lbry:\/\//i, "");

    if (!query) {
      return dispatch({
        type: actions.SEARCH_CANCELLED,
      });
    }

    dispatch({
      type: actions.SEARCH_STARTED,
      data: { query },
    });

    if (page != "search") {
      dispatch(doNavigate("search", { query: query }));
    } else {
      fetch("https://lighthouse.lbry.io/search?s=" + query)
        .then(handleResponse)
        .then(data => {
          let uris = [];
          let actions = [];

          data.forEach(result => {
            const uri = lbryuri.build({
              name: result.name,
              claimId: result.claimId,
            });
            actions.push(doResolveUri(uri));
            uris.push(uri);
          });

          actions.push({
            type: actions.SEARCH_COMPLETED,
            data: {
              query,
              uris,
            },
          });
          dispatch(batchActions(...actions));
        })
        .catch(err => {
          dispatch({
            type: actions.SEARCH_CANCELLED,
          });
        });
    }
  };
}

export const updateSearchQuery = searchQuery => {
  let searchUri;
  try {
    searchUri = lbryuri.normalize(searchQuery);
  } catch (e) {
    // search query isn't a valid uri
  }

  return {
    type: actions.UPDATE_SEARCH_QUERY,
    data: { searchQuery, searchUri },
  };
};

export const getSearchSuggestions = query => dispatch => {
  console.log("start");
  dispatch({ type: actions.GET_SEARCH_SUGGESTIONS_START });

  // need to handle spaces?
  return fetch("https://lighthouse.lbry.io/autocomplete?s=" + query)
    .then(handleResponse)
    .then(suggestions => {
      return dispatch({
        type: actions.GET_SEARCH_SUGGESTIONS_SUCCESS,
        data: suggestions.slice(0, 5).map(suggestion => {
          const hasSpaces = suggestion.indexOf(" ") !== -1;
          return hasSpaces ? suggestion : `lbry://${suggestion}`;
        }),
      });
    })
    .catch(err =>
      dispatch({
        type: actions.GET_SEARCH_SUGGESTIONS_FAIL,
        data: err,
      })
    );
};

export const toggleActiveSearch = isActive => ({
  type: actions.TOGGLE_ACTIVE_SEARCH,
  data: isActive,
});

export const toggleActiveSearchTyping = isActive => ({
  type: actions.TOGGLE_ACTIVE_SEARCH_TYPING,
  data: isActive,
});
