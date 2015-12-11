var childProcess = require('child_process');


function runServer() {
  return childProcess.spawn('/usr/bin/env', ['python', 'manage.py', 'runserver', '127.0.0.1:9002'], {
      stdio: [null, process.stdout, process.stderr]
  });
}


module.exports = runServer;

if (require.main === module) {
  runServer();
}