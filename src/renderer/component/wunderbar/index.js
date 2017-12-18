import React from "react";
import { connect } from "react-redux";
import lbryuri from "lbryuri.js";
import {
  _selectState as selectSearch,
  selectWunderBarAddress,
} from "redux/selectors/search";
import { doNavigate } from "redux/actions/navigation";
import {
  updateSearchQuery,
  toggleActiveSearch,
  toggleActiveSearchTyping,
  getSearchSuggestions,
} from "redux/actions/search";
import Wunderbar from "./view";

const select = state => ({
  ...selectSearch(state),
  address: selectWunderBarAddress(state),
});

const perform = dispatch => ({
  onSearch: query => dispatch(doNavigate("/search", { query })),
  onSubmit: (query, extraParams) =>
    dispatch(
      doNavigate("/show", { uri: lbryuri.normalize(query), ...extraParams })
    ),
  updateSearchQuery: query => dispatch(updateSearchQuery(query)),
  toggleActiveSearch: isActive => dispatch(toggleActiveSearch(isActive)),
  toggleActiveSearchTyping: isTyping =>
    dispatch(toggleActiveSearchTyping(isTyping)),
  getSearchSuggestions: query => dispatch(getSearchSuggestions(query)),
});

export default connect(select, perform)(Wunderbar);
