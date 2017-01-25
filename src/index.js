import { createAction } from 'redux-actions';

/**
 * Creates an async action creator
 *
 * @param  {String} TYPE    the type of the action
 * @param  {Function} fn    the function to be called async
 * @return {Funtion}        the action creator
 */
export function createActionThunk (type, fn) {
  const TYPE_START     = `${type}_STARTED`;
  const TYPE_SUCCEEDED = `${type}_SUCCEEDED`;
  const TYPE_FAILED    = `${type}_FAILED`;
  const TYPE_ENDED     = `${type}_ENDED`;
  const actionCreators = {
    [TYPE_START]     : createAction(TYPE_START),
    [TYPE_SUCCEEDED] : createAction(TYPE_SUCCEEDED),
    [TYPE_FAILED]    : createAction(TYPE_FAILED),
    [TYPE_ENDED]     : createAction(TYPE_ENDED)
  };

  return (...args) => (dispatch, getState, extra) => {
    let result;
    let startedAt = (new Date()).getTime();
    dispatch(actionCreators[TYPE_START](args));
    const succeeded = (data) => {
      dispatch(actionCreators[TYPE_SUCCEEDED](data));
      let endedAt = (new Date()).getTime();
      dispatch(actionCreators[TYPE_ENDED]({
        elapsed: endedAt - startedAt
      }));
      return data;
    };
    const failed = (err) => {
      dispatch(actionCreators[TYPE_FAILED](err));
      throw err;
    }
    try {
      result = fn(...args, {getState, extra});
    } catch (error) {
      failed(error);
    }
    // in case of async (promise), use success and fail callbacks.
    if (isPromise(result)) {
      return result.then(succeeded, failed);
    }
    return succeeded(result);
  }
}

//helpers
function isPromise(p) {
  return p && p.then && p.catch;
}