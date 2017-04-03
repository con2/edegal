import OtherAction from './other';
import User from '../models/User';


const anonymousUser: User = {
  email: '',
  loggedIn: false,
  displayName: '',
};


export default function(state: User = anonymousUser, action: OtherAction = OtherAction) {
  return state;
}
