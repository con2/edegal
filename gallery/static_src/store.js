import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import galleryApp from './reducers';


const store = createStore(galleryApp, applyMiddleware(thunk));


export default store;
