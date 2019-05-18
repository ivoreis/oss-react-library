const replace = require("replace-in-file");
const path = require("path");
const chalk = require('chalk').default;
const { readFileSync, writeFileSync } = require("fs");
const { rm, exec, config } = require("shelljs");
const { prompt } = require('enquirer');

config.silent = true;

/* UTILS */

const omitEntries = (entriesToOmit, original) => {
  return Object.
  keys(original).
  reduce((acc, value)=> {
    if (entriesToOmit.indexOf(value) >= 0) {
      return acc;
    }
    return {
      ...acc,
      [value]: original[value]
    }
  },{})
}

const replacementOptions = (filesToUpdate, variables) => {
  const files = filesToUpdate.map(file => path.resolve(__dirname, '..', file));
  const replacements = variables.reduce((acc, variable)=> (
    {
      from: [...acc.from, variable.match],
      to: [...acc.to, variable.replacement]
    }
  ), { from: [], to: []});
  return {
    ...replacements,
    files
  }
};

const currentPackageName = () => {
  return path
  .basename(path.resolve(__dirname, '..'))
  .replace(/[^\w\d]|_/g, '-')
  .replace(/^-+|-+$/g, '')
  .toLowerCase();
}

/* UTILS */

const dependenciesToRemove = ['enquirer', 'chalk', 'replace-in-file'];
const scriptsToRemove = ['bootstrap'];
const filesToModify = [
  'LICENSE', 
  'CONTRIBUTING.md',
  'CODE-OF-CONDUCT.md',
  'README.md', 
  'package.json', 
  'scripts/gh-pages-publish.js',
  'doczrc.js'
];
const filesToRemove = ['.gitattributes', 'scripts/bootstrap.js'];
const dirsToRemove = ['.git'];

const questions = async () => {
  return await prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is your first and last name?'
    },
    {
      type: 'confirm',
      name: 'useCurrentLibraryName',
      message(){
        return `Do you want to use '${currentPackageName()}' as the library name?`;
      },
    },
    {
      type: 'input',
      name: 'libraryName',
      skip() {
        return this.state.answers.useCurrentLibraryName;
      },
      message: 'What is the library name?',
      validate(value) {
        const isValid =  /^[a-z]+(\-[a-z]+)*$/.test(value);
        if(isValid) {
          this.state.styles.danger('please use "kebab-case" uses lowercase letters, and hyphens for any punctuation');
        }
        return true;
      },
      result(response) {
        return response === '' ? currentPackageName() : response;
      }
    }
  ]);
};

const readJsonPackage = () => {
  const packagePath = path.resolve(__dirname, '..', 'package.json');
  return JSON.parse(readFileSync(packagePath, { encoding: 'utf8'}));
}

const writeJsonPackage = (jsonContent) => {
  const packagePath = path.resolve(__dirname, '..', 'package.json');
  console.log(chalk.cyanBright("[PACKAGE] Writing package.json"));
  writeFileSync(packagePath, JSON.stringify(jsonContent, null, 2));
  console.log(chalk.cyanBright("[PACKAGE] Writing package.json complete"));
}

const replaceFiles = (options) => {
  const { files, from, to } = options;
  try {
    console.log(chalk.cyanBright("[REPLACE] Replacing files"));
    replace.sync({ files, from, to });
    console.log(chalk.whiteBright(files.join('\n')));
    console.log(chalk.cyanBright("[REPLACE] Replacing files complete"));
  } catch (error) {
    console.error('An error occurred modifying the file: ', error);
  }
}

const removeFiles = (filesToRemove) => {
  console.log(chalk.cyanBright("[REMOVE] Removing files"));
  rm(
    '-rf', 
    filesToRemove.map(f => path.resolve(__dirname, '..', f))
  );
  console.log(chalk.redBright(filesToRemove.join('\n')), '\n');
  console.log(chalk.cyanBright("[REMOVE] Removing files complete"));
}

const gitInit = () => {
  console.log(chalk.cyanBright('[GIT] Init'));
  const output = exec(
    'git init "' + path.resolve(__dirname, '..') + '"'
  ).stdout;
  console.log(chalk.whiteBright(output.replace(/(\n|\r)+/g, '')));
  console.log(chalk.cyanBright('[GIT] Init complete'));
}

const handleAnswers = (answers) => {
  const { name, libraryName } = answers;
  console.log(chalk.magentaBright(`Hi ${name}. I'll run my magic now, hang tight!`));

  const variablesToModify = [
    { match: /--libraryname--/g, replacement: libraryName },
    { match: /--fullname--/g, replacement: name },
    { match: /--username--/g, replacement: exec('git config user.name').stdout.trim() },
    { match: /--useremail--/g, replacement: exec('git config user.email').stdout.trim() },
    { match: /--year--/g, replacement: (new Date()).getFullYear().toString() },
  ];

  replaceFiles(
    replacementOptions(filesToModify, variablesToModify)
  );

  const jsonPackage = readJsonPackage();
  const devDependencies = omitEntries(dependenciesToRemove, jsonPackage.devDependencies);
  const scripts = omitEntries(scriptsToRemove, jsonPackage.scripts);

  writeJsonPackage({
    ...jsonPackage,
    devDependencies,
    scripts
  });

  removeFiles([...filesToRemove, ...dirsToRemove]);

  gitInit();

  console.log(chalk.cyanBright('[YARN] Install'));
  exec('yarn', { silent: false }).stdout;
  console.log(chalk.cyanBright('[YARN] Install complete'));
  console.log(chalk.greenBright('You are good to go! You rock!!! 🤘'))
};

const catchError = () => {
  console.log(chalk.redBright('Script aborted!'));
  process.exit(0);
}

// Clear console
process.stdout.write('\x1B[2J\x1B[0f\n');
questions().
  then(handleAnswers).
  catch(catchError);