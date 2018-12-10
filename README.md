redux-thunk-actions
===================

Easily create `action creators` for redux with redux-thunk.

## Rationale

With redux-actions you can do:

```js
let increment = createAction('INCREMENT');
expect(increment(42)).to.deep.equal({
  type: 'INCREMENT',
  payload: 42
});
```

With redux-thunk you can do:

```js
function myFetch() {
  // instead of an object, you can return a function
  return (dispatch) => {
    dispatch({type: 'MY_FETCH_START'});
    try {
      //we can do async and then dispatch more stuff
      await api.fetch();
    }
    catch(e) {
      return dispatch({type: 'MY_FETCH_FAIL', error: e});
    }
    dispatch({type: 'MY_FETCH_END'});
  }
}
dispatch(myFetch());
```

With redux-thunk-actions, you can do:

```js
let myFetch = createActionThunk('MY_FETCH', () => api.fetch());
```

This will generate two of three possible actions:

- MY_FETCH_STARTED
- MY_FETCH_SUCCEEDED
- MY_FETCH_FAILED
- MY_FETCH_ENDED

You can pass both sync and async functions and the actions will be
dispatched accordingly.

## Installation

```js
npm install --save redux-thunk-actions
```

## Usage

```js
import { createActionThunk } from 'redux-thunk-actions';
```

### non-async

With non async functions, it will dispatch start/fail/end actions
anyway.

***reducer.js***
```js
case 'FETCH_SUCCEEDED':
  return Object.assign({}, state, {
    data: action.payload
  });
```
You can dispatch as usual:
```js
let fetch = createActionThunk('FETCH', () => 3);
dispatch(fetch());
assert.equal(store.getState().data, 3);
```

### async

```js
let fetch = createActionThunk('FETCH', myAsyncFunc);
// you can try/catch dispatch.
let data = await dispatch(fetch());
```
With promises:
```js
let fetch = createActionThunk('FETCH', myAsyncFunc);
dispatch(fetch()).then(
  data => {
    console.log(data)
    //state is already updated!
    assert.equal(store.getState().data, data);
  },
  error => console.log(error)
);
```

### Errors

**reducer.js**

```js
//...
    case 'FETCH_FAILED':
      return Object.assign({}, state, {
        started: false,
        error: action.error
      });
```

then if the action throws it fails:

```js
    let fetch = createActionThunk('FETCH', () => {
      throw new Error('boom!');
    });
    try {
      //if action is async, you can use await here!
      dispatch(fetch());
    }
    catch(e) {
      assert.equal(e.message, 'boom!');
      assert.equal(getState().error, true);
    }
```

if you want to suppress throwing exceptions and instead handle errors 100% in the reducers, pass `true` as the 3rd argument

```js
const action = createActionThunk('FETCH', () => 3, true)
```

### Metadata

Sometimes you want to send metada with your actions

To do so just return an object with `payload` and `meta`. This properties will be used to generate those values:

```js
let fetch = createActionThunk('FETCH', () => ({payload: 3, meta: 4}));
dispatch(fetch());
// will dispatch: 
// {type: FETCH_START});
// {type: FETCH_SUCCEEDED, payload: 3, meta: 4});
// {type: FETCH_ENDED, payload: elapsed: 1});
```
