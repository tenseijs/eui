const rimraf = require('rimraf');

rimraf.sync('dist');
rimraf.sync('lib');
rimraf.sync('types');
rimraf.sync('es');
rimraf.sync('test-env');
