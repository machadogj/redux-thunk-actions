import assert from 'assert';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createActionThunk } from '../src';

const reducer = (state = { started: false, data: null, error: null }, action) => {
  console.log(action.type, action.payload, action.error);
  switch(action.type) {
    case 'FETCH_STARTED':
      return Object.assign({}, state, {
        started: true,
        error: null,
        data: null
      });
    case 'FETCH_FAILED':
      return Object.assign({}, state, {
        started: false,
        error: action.error
      });
    case 'FETCH_ENDED':
      return Object.assign({}, state, {
        started: false,
        data: action.payload
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
    assert.equal(this.store.getState().started, false);
    assert.equal(this.store.getState().data, 3);
  });

  it('should dispatch and return payload with non async functions', function () {
    let fetch = createActionThunk('FETCH', () => 2);
    let result = this.store.dispatch(fetch());
    assert.equal(result, 2);
  });

  it('should dispatch async function', function (done) {
    let resolve;
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

  it('should throw on error', function () {
    let fetch = createActionThunk('FETCH', () => {
      throw new Error('boom!');
    });
    try {
      this.store.dispatch(fetch());
    }
    catch(e) {
      assert.equal(e.message, 'boom!');
      assert.equal(this.store.getState().error, true);
    }
  });
});

// helpers
function myAsyncFunc() {
  return new Promise(resolve => setTimeout(()=>resolve(10), 50));
}
