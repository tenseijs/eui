const { execSync } = require('child_process');
const chalk = require('chalk');
const shell = require('shelljs');
const path = require('path');
const glob = require('glob');
const fs = require('fs');
const dtsGenerator = require('dts-generator').default;

function compileLib() {
  shell.mkdir('-p', 'lib/services', 'lib/test');

  console.log('Compiling src/ to es/, lib/, and test-env/');

  // Run all code (com|trans)pilation through babel (ESNext JS & TypeScript)

  execSync(
    'babel --quiet --out-dir=es --extensions .js,.ts,.tsx --ignore "**/webpack.config.js,**/*.test.js,**/*.test.ts,**/*.test.tsx,**/*.d.ts,**/*.testenv.js,**/*.testenv.tsx,**/*.testenv.ts,**/*.spec.tsx" src',
    {
      env: {
        ...process.env,
        BABEL_MODULES: false,
        NO_COREJS_POLYFILL: true,
      },
    }
  );

  execSync(
    'babel --quiet --out-dir=lib --extensions .js,.ts,.tsx --ignore "**/webpack.config.js,**/*.test.js,**/*.test.ts,**/*.test.tsx,**/*.d.ts,**/*.testenv.js,**/*.testenv.tsx,**/*.testenv.ts,**/*.spec.tsx" src',
    {
      env: {
        ...process.env,
        NO_COREJS_POLYFILL: true,
      },
    }
  );

  execSync(
    'babel --quiet --out-dir=test-env --extensions .js,.ts,.tsx --config-file="./.babelrc-test-env.js" --ignore "**/webpack.config.js,**/*.test.js,**/*.test.ts,**/*.test.tsx,**/*.d.ts,**/*.spec.tsx" src',
    {
      env: {
        ...process.env,
        NO_COREJS_POLYFILL: true,
      },
    }
  );
  glob('./test-env/**/*.testenv.js', undefined, (error, files) => {
    files.forEach(file => {
      const dir = path.dirname(file);
      const fileName = path.basename(file, '.js');
      const targetName = fileName.replace('.testenv', '');
      fs.renameSync(file, path.join(dir, `${targetName}.js`));
    });
  });

  console.log(chalk.green('✔ Finished compiling src/'));

  // Use `compile-types.js` file to emit typescript declaration files for .ts files
  console.log('Generating typescript definitions files');
  execSync(`node ${path.resolve(__dirname, 'compile-types.js')}`, {
    stdio: 'inherit',
  });

  console.log(chalk.green('✔ Finished generating definitions'));

  // Also copy over SVGs. Babel has a --copy-files option but that brings over
  // all kinds of things we don't want into the lib folder.
  shell.mkdir('-p', 'lib/components/icon/svgs', 'lib/components/icon/svgs/tokens');

  glob('./src/components/**/*.svg', undefined, (error, files) => {
    files.forEach(file => {
      const splitPath = file.split('/');
      const basePath = splitPath.slice(2, splitPath.length).join('/');
      shell.cp('-f', `${file}`, `lib/${basePath}`);
    });

    console.log(chalk.green('✔ Finished copying SVGs'));
  });
}

function compileBundle() {
  shell.mkdir('-p', 'dist');

  console.log('Building bundle...');
  execSync('webpack --config=src/webpack.config.js', {
    stdio: 'inherit',
    env: {
      ...process.env,
      BABEL_MODULES: false,
    },
  });

  console.log('Building minified bundle...');
  execSync('NODE_ENV=production NODE_OPTIONS=--max-old-space-size=4096 webpack --config=src/webpack.config.js', {
    stdio: 'inherit',
    env: {
      ...process.env,
      BABEL_MODULES: false,
    },
  });

  console.log('Building test utils .d.ts files...');
  dtsGenerator({
    prefix: '',
    out: 'lib/test/index.d.ts',
    baseDir: path.resolve(__dirname, '..', 'src/test/'),
    files: ['index.ts'],
    resolveModuleId({ currentModuleId }) {
      return `@elastic/eui/lib/test${currentModuleId !== 'index' ? `/${currentModuleId}` : ''}`;
    },
    resolveModuleImport({ currentModuleId, importedModuleId }) {
   		if (currentModuleId === 'index') {
  			return `@elastic/eui/lib/test/${importedModuleId.replace('./', '')}`;
  		}
			return null;
	  }
  });
  dtsGenerator({
    prefix: '',
    out: 'es/test/index.d.ts',
    baseDir: path.resolve(__dirname, '..', 'src/test/'),
    files: ['index.ts'],
    resolveModuleId({ currentModuleId }) {
      return `@elastic/eui/es/test${currentModuleId !== 'index' ? `/${currentModuleId}` : ''}`;
    },
    resolveModuleImport({ currentModuleId, importedModuleId }) {
   		if (currentModuleId === 'index') {
          return `@elastic/eui/es/test/${importedModuleId.replace('./', '')}`;
  		}
			return null;
	  }
  });
  console.log(chalk.green('✔ Finished test utils files'));
}

compileLib();
compileBundle();
