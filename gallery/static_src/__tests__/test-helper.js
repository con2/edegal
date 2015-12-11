import Browser from 'zombie';

import runServer from '../../../run-server.js';


var serverProcess = null;


// Django server setup
before(function(done) {
  serverProcess = runServer();

  console.log('hello from before');

  // XXX cannot done until Django responds
  setTimeout(done, 500);
});

after(function() {
  console.debug('killing server process');
  serverProcess.kill();
});


// zombie.js setup
Browser.localhost('gallery.example.com', 9002);
