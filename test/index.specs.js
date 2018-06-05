/* eslint-env node, mocha */
/* global Promise */
import assert from 'assert';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import configureMockStore from 'redux-mock-store';
import { createActionThunk } from '../src';

const reducer = (state = { started: false, data: null, error: null }, action) => {
  console.log(action.type, action.payload, action.error); //eslint-disable-line
  switch(action.type) {
    case 'FETCH_STARTED':
      return Object.assign({}, state, {
        started: true,
        error: null,
        data: null
      });
    case 'FETCH_FAILED':
      return Object.assign({}, state, {
        error: action.error
      });
    case 'FETCH_SUCCEEDED':
      return Object.assign({}, state, {
        data: action.payload
      });
    case 'FETCH_ENDED':
      return Object.assign({}, state, {
        started: false
      });
    default:
      return state;
  }
}

describe('createActionThunk', () => {
  beforeEach(function () {
    this.store = createStore(
        reducer,
        applyMiddleware(...[thunkMiddleware])
    );
  });

  it('should dispatch non async functions', function () {
    let fetch = createActionThunk('FETCH', () => 3);
    this.store.dispatch(fetch());
    // assert.equal(this.store.getState().started, false);
    assert.equal(this.store.getState().data, 3);
  });

  it('should dispatch and return payload with non async functions', function () {
    let fetch = createActionThunk('FETCH', () => 2);
    let result = this.store.dispatch(fetch());
    assert.equal(result, 2);
  });

  it('should dispatch async function', function (done) {
    let fetch = createActionThunk('FETCH', myAsyncFunc);
    let promise = this.store.dispatch(fetch());
    assert.equal(this.store.getState().started, true);
    assert.equal(this.store.getState().data, null);
    promise.then((data)=> {
      assert.equal(this.store.getState().started, false);
      assert.equal(this.store.getState().data, 10);
      assert.equal(data, 10);
      done();
    }, done);
  });

  it('should dispatch FAILED, then ERROR and then throw on error', function () {
    let fetch = createActionThunk('FETCH', () => {
      throw new Error('boom!');
    });
    try {
      this.store.dispatch(fetch());
    }
    catch(e) {
      assert.equal(e.message, 'boom!');
      assert.equal(this.store.getState().started, false);
      assert.equal(this.store.getState().error, true);
    }
  });
  
  it('should work with empty payload', function () {
    const middlewares = [thunkMiddleware] // add your middlewares like `redux-thunk`
    const mockStore = configureMockStore(middlewares);
    const store = mockStore({});
    
    let fetch = createActionThunk('FETCH', () => {});
    store.dispatch(fetch());

    const actions = store.getActions();
    assert.equal(actions.length, 3);

    const [start, success, ended] = actions;
    assert.deepEqual(start, {type: fetch.START, payload: []});
    assert.deepEqual(success, {type: fetch.SUCCEEDED});
    assert.equal(ended.type, fetch.ENDED);
  });

  describe('with meta', function () {
    const middlewares = [thunkMiddleware] // add your middlewares like `redux-thunk`
    const mockStore = configureMockStore(middlewares);

    beforeEach(() => {
      this.store = mockStore({});
    });

    it('should dispatch action with meta', () => {
      let fetch = createActionThunk('FETCH', () => ({payload: 2, meta: 3}));
      this.store.dispatch(fetch(1));

      const actions = this.store.getActions();
      assert.equal(actions.length, 3);

      const [start, success, ended] = actions;
      assert.deepEqual(start, {type: fetch.START, payload: [1]});
      assert.deepEqual(success, {type: fetch.SUCCEEDED, payload: 2, meta: 3});
      assert.equal(ended.type, fetch.ENDED);
    });
  });
});

// helpers
function myAsyncFunc() {
  return new Promise(resolve => setTimeout(()=>resolve(10), 50));
}
