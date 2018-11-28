import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import logo from './logo.svg';
import { sortBy } from 'lodash';
import classNames from 'classnames';
import './App.css';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}`;

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
}

const updateSearchTopStoriesState = (hits, page) => (prevState) => {
  const { searchKey, results } = prevState;
    
  const oldHits =  results && results[searchKey]
    ? results[searchKey].hits
    : [];

  const updatedHits = [
    ...oldHits,
    ...hits
  ];

  return {
    results: {
    ...results,
    [searchKey] : {hits: updatedHits, page }
    },
    isLoading: false
  }
}

class App extends Component {
  _isMounted = false;
  constructor(props) {
    super(props);
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
    };
    
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  };
  
  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  onDismiss(id) {
    const { searchKey, results } = this.state;
    const { hits, page } = results[searchKey];

    const isNotId = item => item.objectID !== id;
    const updatedHits = hits.filter(isNotId)

    this.setState({
      results: {
        ...results,
        [searchKey] : {hits: updatedHits, page}
      }
    });
  };

  setSearchTopStories(result) {
    const { hits, page } = result;
    this.setState(updateSearchTopStoriesState(hits, page));
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({ isLoading: true });

    axios(`${url}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this._isMounted && this.setSearchTopStories(result.data))
      .catch(error => this._isMounted && this.setState({ error }));
  }

  onSearchChange(event) {
    this.setState({ searchTerm: event.target.value });
  }
  
  componentDidMount() {
    this._isMounted = true;
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchSearchTopStories(searchTerm);
  }

  onSearchSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    if (this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const { 
      searchTerm,
      results,
      searchKey,
      error,
      isLoading,
      } = this.state;
      
    if (error) {
      return <p>Oh no, something went wrong!</p>;
    }

    const page = (
      results &&
      results[searchKey] &&
      results[searchKey].page
      ) || 0;
    
    const list = (
      results &&
      results[searchKey] &&
      results[searchKey].hits
    ) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search
              value={searchTerm}
              onChange={this.onSearchChange}
              onSubmit={this.onSearchSubmit}
            >
              Search
            </Search>
        </div>
        { error
          ? <div className="interactions">
              <p>Oh oh! Something went wrong.</p>
            </div>
            : 
            <Table
              list={list}
              onSort={this.onSort}
              onDismiss={this.onDismiss}
            />
        }
        <div className="interactions">
          <ButtonWithLoading
            isLoading={isLoading}
            onClick={() => this.fetchSearchTopStories(searchKey, page + 1)}
          >
            More
          </ButtonWithLoading>
          }
        </div>
      </div>
    )
  }
}

class Search extends Component {
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }
  render() {
    const {
      value, onChange, onSubmit, children 
    } = this.props;

    return (
    <form onSubmit={onSubmit}>
      <input 
      type="text"
      value={value}
      onChange={onChange}
      ref={el => this.input = el}
      />
      <button type="submit" className="search-button">
        {children}
      </button>
    </form>
    )
  }
}


class Table extends Component {
  constructor(props) {
    super(props);

    this.state = {
      sortKey: 'NONE',
      isSortReverse: false,
    };

    this.onSort = this.onSort.bind(this);
  }
  

  onSort(sortKey) {
    const isSortReverse = this.state.sortKey === sortKey &&
      !this.state.isSortReverse;

    this.setState({ sortKey, isSortReverse });
  }

  render() {
    const {
      list,
      onDismiss
    } = this.props;
    
    const {
      sortKey,
      isSortReverse
    } = this.state;

  const sortedList = SORTS[sortKey](list);
  const reverseSortedList = isSortReverse
    ? sortedList.reverse()
    : sortedList;
  
  return (
    <div className="table">
      <div className="table-header">
        <span style={{ width: '40%' }}>
          <Sort
            sortKey={'TITLE'}
            onSort={this.onSort}
            activeSortKey={sortKey}
          >
            Title
          </Sort>
        </span>
        <span style={{ width: '30%' }}>
          <Sort
            sortKey={'AUTHOR'}
            onSort={this.onSort}
            activeSortKey={sortKey}
          >
            Author
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort
            sortKey={'COMMENTS'}
            onSort={this.onSort}
            activeSortKey={sortKey}
          >
            Comments
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          <Sort
            sortKey={'POINTS'}
            onSort={this.onSort}
            activeSortKey={sortKey}
          >
            Points
          </Sort>
        </span>
        <span style={{ width: '10%' }}>
          Archive
        </span>
      </div>
      {reverseSortedList
        .map(item => {
          const onHandleDismiss = () => onDismiss(item.objectID);
          return (
          <div key={item.objectID} className="table-row">
              <span style={{ width: '40%' }}>
                <a href={item.url}>{item.title}</a>
              </span>
              <span style={{ width: '30%' }}>
                {item.author}
              </span>
              <span style={{ width: '10%' }}>
                {item.num_comments}
              </span>
              <span style={{ width: '10%' }}>
                {item.points}
              </span>
              <span>
                  <Button 
                    onClick={ () => onDismiss(item.objectID)}
                    className="button-inline dismiss"
                  >
                    Dismiss
                  </Button>
              </span>
            </div>
          )
        })
      }
    </div>
  );
  }
}

const Button = ({
      onClick,
      className,
      children,
    }) => 
      <button
        onClick={onClick}
        className={className}
        type="button"
      >
        {children}
      </button>


const Loading = () =>
    <div>Loading...</div> 


const withLoading = (Component) => ({isLoading, ...rest}) =>
    isLoading
      ? <Loading />
      : <Component { ...rest } />

const ButtonWithLoading = withLoading(Button);

const Sort = ({
  sortKey,
  activeSortKey,
  onSort,
  children
}) => {
    const sortClass = classNames(
      'button-inline',
      { 'button-active': sortKey === activeSortKey}
    );
    
    return (
      <Button
      onClick={() => onSort(sortKey)}
      className={sortClass}
      >
      {children}
    </Button>
  )
}
  
  Button.defaultProps = {
  className: '',
};

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
    objectID: PropTypes.string.isRequired,
    author: PropTypes.string,
    url: PropTypes.string,
    num_comments: PropTypes.number,
    points: PropTypes.number,
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
};

Search.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSubmit: PropTypes.func,
  children: PropTypes.node,
}


export default App;

export {
  Button,
  Search,
  Table,
  updateSearchTopStoriesState
}
