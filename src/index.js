import { createAction } from 'redux-actions';

export function createActionThunk (type, fn) {
  const TYPE_START = `${type}_STARTED`;
  const TYPE_FAIL = `${type}_FAILED`;
  const TYPE_SUCCESS = `${type}_ENDED`;
  const actionCreators = {
    [TYPE_START]   : createAction(TYPE_START),
    [TYPE_SUCCESS] : createAction(TYPE_SUCCESS),
    [TYPE_FAIL]    : createAction(TYPE_FAIL)
  };

  return (...args) => (dispatch) => {
    dispatch(actionCreators[TYPE_START](args));
    let result;
    try {
      result = fn(...args);
    } catch (error) {
      dispatch(actionCreators[TYPE_FAIL](error));
      throw error;
    }
    if (result && result.then && result.catch) {
      return result
        .then((data) => {
          dispatch(actionCreators[TYPE_SUCCESS](data));
          return data;
        }, (err) => {
          dispatch(actionCreators[TYPE_FAIL](err));
          throw err;
        });
    }
    dispatch(actionCreators[TYPE_SUCCESS](result));
    return result;
  }
}
