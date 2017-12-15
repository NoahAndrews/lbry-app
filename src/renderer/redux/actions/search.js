import * as types from "constants/action_types";
import lbryuri from "lbryuri";
import { doResolveUri } from "redux/actions/content";
import { doNavigate } from "redux/actions/navigation";
import { selectCurrentPage } from "redux/selectors/navigation";
import batchActions from "util/batchActions";

export function doSearch(rawQuery) {
  return function(dispatch, getState) {
    const state = getState();
    const page = selectCurrentPage(state);

    const query = rawQuery.replace(/^lbry:\/\//i, "");

    if (!query) {
      return dispatch({
        type: types.SEARCH_CANCELLED,
      });
    }

    dispatch({
      type: types.SEARCH_STARTED,
      data: { query },
    });

    if (page != "search") {
      dispatch(doNavigate("search", { query: query }));
    } else {
      fetch("https://lighthouse.lbry.io/search?s=" + query)
        .then(response => {
          return response.status === 200
            ? Promise.resolve(response.json())
            : Promise.reject(new Error(response.statusText));
        })
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
            type: types.SEARCH_COMPLETED,
            data: {
              query,
              uris,
            },
          });
          dispatch(batchActions(...actions));
        })
        .catch(err => {
          dispatch({
            type: types.SEARCH_CANCELLED,
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
    type: types.UPDATE_SEARCH_QUERY,
    data: { searchQuery, searchUri },
  };
};

export const toggleActiveSearch = isActive => ({
  type: types.TOGGLE_ACTIVE_SEARCH,
  data: isActive,
});

export const toggleActiveSearchTyping = isActive => ({
  type: types.TOGGLE_ACTIVE_SEARCH_TYPING,
  data: isActive,
});
