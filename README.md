# <img src="https://public.gavignon.io/images/sfdc-generate-data-dictionary-title.png" height="32">
![version](https://img.shields.io/badge/version-1.2.8-blue)

Generate data dictionary from a Salesforce Org. This tool can also generate a file that can be imported in Lucidchart to define entities and relationships.

## Getting Started

Works in Unix like system. Windows is not tested.

### Installing

```
npm install -g sfdc-generate-data-dictionary
```

## Screenshots

<img src="https://public.gavignon.io/images/sfdc-generate-data-dictionary-screen1.png" width="100%">

## Usage

### Command Line

```
$ sgd -h

  Usage: sgd [options]

  Generate data dictionary from a Salesforce Org

  Options:

    -u, --username [username]                             targetusername
    -l, --loginUrl [loginUrl]                             salesforce login URL [https://login.salesforce.com]
    -c, --allCustomObjects [allCustomObjects]             retrieve all custom objects [true]
    -lc, --lucidchart [lucidchart]                        generate ERD file for Lucidchart [true]
    -s, --sobjects [sobjects]                             sObjects to retrieve separated with commas [Account,Contact,User], if set then allCustomObjects is ignored
    -D, --debug [debug]                                   generate debug log file [false]
    -d, --deleteFolders [deleteFolders]                   delete/clean temp folders [true]
    -e, --excludeManagedPackage [excludeManagedPackage]   exclude managed packaged [true]
    -ht, --hideTechFields [hideTechFields]                hide tech fields [false]
    -tp, --techFieldPrefix [techFieldPrefix]              Tech field prefix ['TECH_']
    -o, --output [dir]                                    salesforce data dictionary directory path [.]
```

#### Example
```
$ bin/cli -u "targetusername" -l "https://test.salesforce.com" --sobjects "Account,Contact,Opportunity,Case" -c false
```

### Module

```
  var sgd = require('sfdc-generate-data-dictionary');

  sgd({
      'username': 'targetUsername',
      'loginUrl': options.loginUrl,
      'projectName': '',
      'allCustomObjects': true,
      'debug': false,
      'cleanFolders': true,
      'output':'.'
      }, console.log);
```

## Debugging

Since **1.0.3**, you can now run the tool in debug mode to generate a file that contains information about each step during the process.
Information contained in the debug files will be enriched following your feedback to have the most accurate information for debugging.

Please paste the content of this file in your issues to help analysis.

### Debug files location

For a local module:
```
CURRENT_DIR/node_modules/sfdc-generate-data-dictionary/files
 ```

 Global module:
 - Mac: /usr/local/lib/node_modules/sfdc-generate-data-dictionary/files
 - Windows: %AppData%\npm\node_modules\sfdc-generate-data-dictionary\files

## Built With

- [commander](https://github.com/tj/commander.js/) - The complete solution for node.js command-line interfaces, inspired by Ruby's commander.
- [bytes](https://github.com/visionmedia/bytes.js) - Utility to parse a string bytes to bytes and vice-versa.
- [excel4node](https://github.com/amekkawi/excel4node) - Node module to allow for easy Excel file creation.
- [REST explorer sfdx plugin](https://github.com/tythonco/rest-explorer-sfdx-plugin) - Plugin for sfdx to provide direct access to the Salesforce REST API.

## Versioning

[SemVer](http://semver.org/) is used for versioning.

## Authors

- **Gil Avignon** - _Initial work_ - [gavignon](https://github.com/gavignon)

## License

This project is licensed under the MIT License - see the <LICENSE.md> file for details
