import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import App, { Search, Button, Table, updateSearchTopStoriesState } from './App';

Enzyme.configure({ adapter: new Adapter() });

describe('App', () => {

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<App />, div);
    ReactDOM.unmountComponentAtNode(div);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <App />
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })

})
  
describe('Search', () => {

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Search>Search</Search>, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Search>Search</Search>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
})

describe('Button', () => {
  
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Button>Give Me More</Button>, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  it('is a button', () => {
    const element = shallow(
      <Button />
    );
    expect(element.find('[type="button"]'));
  })

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Button>Give Me More</Button>
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
})

describe('Table', () => {

  const props = {
    list: [
      { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'y'},
      { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'z'},
    ],
    sortKey: 'TITLE',
    isSortReverse: false,
  }

  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Table { ...props } />, div);
    ReactDOM.unmountComponentAtNode(div);
  })

  it('shows two items in list', () => {
    const element = shallow(
      <Table { ...props } />
    );

    expect(element.find('.table-row').length).toBe(2);
  });

  test('has a valid snapshot', () => {
    const component = renderer.create(
      <Table { ...props } />
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  })
  
})

describe('updateSearchTopStoriesState', () => {
  const results = {
    results: {
      'react': {
        hits: [
        { title: '1', author: '1', num_comments: 1, points: 2, objectID: 'w'},
        { title: '2', author: '2', num_comments: 1, points: 2, objectID: 'x'},
      ]},
    }
  }
  const searchKey = 'react';

  const hits = [
    { title: '3', author: '3', num_comments: 1, points: 2, objectID: 'y'},
    { title: '4', author: '4', num_comments: 1, points: 2, objectID: 'z'},
  ]
  const page = 1;

  it('updates top results', () => {
    const prevState = {searchKey, results}
    const newResults = updateSearchTopStoriesState(hits, page);

    expect(prevState != newResults).toBe(true);
  })

})
