'use strict';

// polyfills
import 'isomorphic-fetch';

import ko from 'knockout';
import page from 'page';

import MainViewModel from './viewmodels/MainViewModel';


ko.applyBindings(new MainViewModel());
page();
