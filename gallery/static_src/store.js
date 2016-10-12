import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

import galleryApp from './reducers';


const
    logger = createLogger(),
    store = createStore(galleryApp, applyMiddleware(thunk, logger));


export default store;