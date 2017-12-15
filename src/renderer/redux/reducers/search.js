import * as actions from "constants/action_types";
import { handleActions } from "util/redux-utils";

const defaultState = {
  urisByQuery: {},
  isActive: false,
  searchQuery: "",
  searchUri: "",
  isActivelySearching: false,
};

export default handleActions(
  {
    [actions.SEARCH_STARTED]: function(state, action) {
      const { query } = action.data;

      return Object.assign({}, state, {
        searching: true,
      });
    },
    [actions.SEARCH_COMPLETED]: function(state, action) {
      const { query, uris } = action.data;

      return Object.assign({}, state, {
        searching: false,
        urisByQuery: Object.assign({}, state.urisByQuery, { [query]: uris }),
      });
    },

    [actions.SEARCH_CANCELLED]: function(state, action) {
      return Object.assign({}, state, {
        searching: false,
      });
    },

    [actions.TOGGLE_ACTIVE_SEARCH]: (state, action) => ({
      ...state,
      isActive: action.data,
    }),

    [actions.UPDATE_SEARCH_QUERY]: (state, action) => ({
      ...state,
      searchQuery: action.data.searchQuery,
      searchUri: action.data.searchUri,
    }),

    [actions.TOGGLE_ACTIVE_SEARCH_TYPING]: (state, action) => ({
      ...state,
      isActivelySearching: action.data,
    }),

    // clear the searchQuery on back/forward
    // it may be populated by the page title for search/file pages
    // if going home, it should be blank
    [actions.HISTORY_NAVIGATE]: (state, action) => {
      return {
        ...state,
        searchQuery: "",
        isActivelySearching: false,
      };
    },
  },
  defaultState
);
