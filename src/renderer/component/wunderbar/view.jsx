import React from "react";
import lbryuri from "lbryuri.js";
import { Icon } from "component/common.js";
import { parseQueryParams } from "util/query_params";
import classnames from "classnames";
import Link from "component/link";

// type Props = {
//   onSearch: () => void,
//   onSubmit: () => void,
// }

class WunderBar extends React.PureComponent {
  static TYPING_TIMEOUT = 800;

  constructor(props) {
    super(props);
    this._userTypingTimer = null;
    this._input = null;

    this.onChange = this.onChange.bind(this);
    this.onFocus = this.onFocus.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onKeyPress = this.onKeyPress.bind(this);
  }

  componentWillUnmount() {
    if (this._userTypingTimer) {
      clearTimeout(this._userTypingTimer);
    }
  }

  onKeyPress(event) {
    const {
      searchQuery,
      searchUri,
      onSearch,
      onSubmit,
      toggleActiveSearch,
    } = this.props;
    // user pressed enter
    if (event.charCode === 13 && searchQuery) {
      this._input.blur();
      toggleActiveSearch(false);
      return searchUri ? onSubmit(searchUri) : onSearch(searchQuery);
    }

    // handle down/up keys to navigate directly to suggested search result
  }

  onChange(event) {
    const {
      updateSearchQuery,
      isActivelySearching,
      toggleActiveSearchTyping,
      getSearchSuggestions,
    } = this.props;

    if (!isActivelySearching) {
      toggleActiveSearchTyping(true);
    }

    const { value } = event.target;

    if (this._userTypingTimer) {
      clearTimeout(this._userTypingTimer);
    }

    updateSearchQuery(value);

    this._userTypingTimer = setTimeout(() => {
      if (value) {
        getSearchSuggestions(value);
      }
    }, WunderBar.TYPING_TIMEOUT); // 800ms delay, tweak for faster/slower
  }

  onFocus() {
    const { query, toggleActiveSearch } = this.props;

    if (query) {
      // will need to do something for suggested results here
    }

    toggleActiveSearch(true);
  }

  onBlur(e) {
    const { toggleActiveSearch } = this.props;

    if (this._userTypingTimer) {
      clearTimeout(this._userTypingTimer);
    }
    // debugger;
    toggleActiveSearch(false);
  }

  render() {
    const {
      searchQuery,
      searchUri,
      isActive,
      address,
      isActivelySearching,
      searchingForSuggestions,
      suggestions,
      doNavigate,
    } = this.props;

    const wunderbarValue = isActivelySearching
      ? searchQuery
      : searchQuery || address;

    // debugger;

    return (
      <div
        className={classnames("header__wunderbar", {
          "header__wunderbar--active": isActive,
        })}
      >
        <Icon fixed icon="icon-search" />
        <input
          className="wunderbar__input"
          type="search"
          ref={ref => (this._input = ref)}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onChange={this.onChange}
          onKeyPress={this.onKeyPress}
          value={wunderbarValue}
          placeholder={__("Search for videos, movies, and more")}
        />
        <div className="header__wunderbar-search-results">
          {searchQuery &&
            isActive && (
              <ul>
                {searchUri && (
                  <li key="-2">
                    <Link
                      noStyle
                      label={searchUri}
                      onMouseDown={() => {
                        doNavigate("/show", { uri: searchUri });
                      }}
                    />
                  </li>
                )}
                {searchQuery && (
                  <li key="-1">
                    <Link
                      noStyle
                      label={__("View search results")}
                      onMouseDown={() => {
                        doNavigate("/search", { query: searchQuery });
                      }}
                    />
                  </li>
                )}
                {searchingForSuggestions && <li key="0">Searching...</li>}
                {!searchingForSuggestions &&
                  !!suggestions.length &&
                  suggestions.map((suggestion, index) => {
                    return (
                      <li key={index}>
                        <Link
                          noStyle
                          label={suggestion}
                          onMouseDown={() => {
                            if (suggestion.startsWith("lbry://")) {
                              console.log("lbry uri");
                              doNavigate("/show", { uri: suggestion });
                              return;
                            }

                            doNavigate("/search", { query: suggestion });
                          }}
                        />
                      </li>
                    );
                  })}
              </ul>
            )}
        </div>
      </div>
    );
  }
}

export default WunderBar;
