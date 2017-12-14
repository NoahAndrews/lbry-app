import React from "react";
import lbryuri from "lbryuri.js";
import { Icon } from "component/common.js";
import { parseQueryParams } from "util/query_params";
import classnames from "classnames";

// type Props = {
//   onSearch: () => void,
//   onSubmit: () => void
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

    this.state = {
      value: "",
      isSearchPending: false,
      isActive: false,
    };
  }

  componentWillUnmount() {
    if (this._userTypingTimer) {
      clearTimeout(this._userTypingTimer);
    }

    this._input = null;
  }

  onChange(event) {
    const { value } = event.target;

    if (this._userTypingTimer) {
      clearTimeout(this._userTypingTimer);
    }

    let newState = { value };

    let uri;
    try {
      uri = lbryuri.normalize(value);
      newState.uri = uri;
    } catch (e) {
      // search term isn't a valid uri (has spaces in it / other stuff)
      newState.uri = "";
    }

    this.setState(newState);

    this._userTypingTimer = setTimeout(() => {
      // pull suggested search results/autocomplete value (same api call for both?)
    }, WunderBar.TYPING_TIMEOUT); // 800ms delay, tweak for faster/slower
  }

  onFocus() {
    const { value } = this.state;

    if (value) {
      // will need to do something for suggested results here
    }

    this.setState({ isActive: true });
  }

  onBlur() {
    if (this._userTypingTimer) {
      clearTimeout(this._userTypingTimer);
    }

    this.setState({ isActive: false });
  }

  componentDidUpdate() {
    // if (this._input) {
    //   const start = this._input.selectionStart,
    //     end = this._input.selectionEnd;
    //
    //   this._input.value = this.state.address; //this causes cursor to go to end of input
    //
    //   this._input.setSelectionRange(start, end);
    //
    //   if (this._focusPending) {
    //     this._input.select();
    //     this._focusPending = false;
    //   }
    // }
  }

  onKeyPress(event) {
    const { value, uri } = this.state;
    const { onSearch, onSubmit } = this.props;

    // user pressed enter
    if (event.charCode === 13 && value) {
      this.setState({ isActive: false });
      this._input.blur();
      return uri ? onSubmit(uri) : onSearch(value);
    }
  }

  render() {
    const { value, uri, isActive, icon } = this.state;
    return (
      <div
        className={classnames("header__wunderbar", {
          "header__wunderbar--active": isActive,
        })}
      >
        <Icon fixed icon="search" />
        <input
          className="wunderbar__input"
          type="search"
          ref={ref => (this._input = ref)}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onChange={this.onChange}
          onKeyPress={this.onKeyPress}
          value={value}
          placeholder={__("Search for videos, movies, and more")}
        />
        <div className="header__wunderbar-search-results">
          {value &&
            isActive && (
              <ul>{uri && <li className="wunderbar__uri">{uri}</li>}</ul>
            )}
        </div>
      </div>
    );
  }
}

export default WunderBar;
