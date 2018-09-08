import User from '../models/User';
import OtherAction from './other';


const anonymousUser: User = {
  email: '',
  loggedIn: false,
  displayName: '',
};


export default function(state: User = anonymousUser, action: OtherAction = OtherAction) {
  return state;
}
