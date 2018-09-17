import User from '../models/User';
import OtherAction from './other';

// TBD

export type UserAction = OtherAction;


const anonymousUser: User = {
  email: '',
  loggedIn: false,
  displayName: '',
};




export default function user(state: User = anonymousUser, action: UserAction = OtherAction) {
  return state;
}
