import Immutable from 'immutable';
import {createReducer} from 'redux-immutablejs';


export const SELECT_PICTURE = 'edegal/picture/SELECT_PICTURE';


const initialState = Immutable.fromJS({});


export default createReducer(initialState, {
  [SELECT_PICTURE]: (state, action) => Immutable.fromJS(action.payload.picture),
});
