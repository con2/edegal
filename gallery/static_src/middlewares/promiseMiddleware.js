export default function promiseMiddleware() {
  return store => next => action => {  // eslint-disable-line no-unused-vars
    const {payload, types} = action;

    // Only act on Promise payloads
    if (!payload || typeof payload.then === 'undefined') {
      return next(action);
    }

    const [REQUEST, SUCCESS, FAILURE] = types;
    next({type: REQUEST});

    payload.then(
      result => next({payload: result, type: SUCCESS}),
      error => next({payload: error, error: true, type: FAILURE})
    ).catch(error => {
      console.error('MIDDLEWARE ERROR:', error);  // eslint-disable-line no-console
      next({payload: error, error: true, type: FAILURE});
    });

    return payload;
  };
}
