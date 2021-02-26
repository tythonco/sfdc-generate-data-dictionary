'use strict';
const ChildProcess = require('child_process');
const Downloader = require('./lib/downloader.js');
const ExcelBuilder = require('./lib/excelbuilder.js');
const Utils = require('./lib/utils.js');

module.exports = (config, logger) => {



  // Check all mandatory config options
  if (typeof config.username === 'undefined' || config.username === null) {
    throw new Error('No username/alias defined for authentication');
  }

  // Set default values
  if (typeof config.loginUrl === 'undefined' || config.loginUrl === null) {
    config.loginUrl = 'https://login.salesforce.com';
  }
  if (typeof config.output === 'undefined' || config.output === null) {
    config.output = '.';
  }
  if (typeof config.debug === 'undefined' || config.debug === null) {
    config.debug = false;
  }
  config.debug = (config.debug === "true" || config.debug === true);

  if (typeof config.excludeManagedPackage === 'undefined' || config.excludeManagedPackage === null) {
    config.excludeManagedPackage = true;
  }
  config.excludeManagedPackage = (config.excludeManagedPackage === "true" || config.excludeManagedPackage === true);

  if (typeof config.projectName === 'undefined' || config.projectName === null) {
    config.projectName = '';
  }
  if (typeof config.allCustomObjects === 'undefined' || config.allCustomObjects === null) {
    config.allCustomObjects = true;
  }
  config.allCustomObjects = (config.allCustomObjects === "true" || config.allCustomObjects === true);

  if (typeof config.lucidchart === 'undefined' || config.lucidchart === null) {
    config.lucidchart = true;
  }
  config.lucidchart = (config.lucidchart === "true" || config.lucidchart === true);

  if (typeof config.sobjects === 'undefined' || config.sobjects === null) {
    if (!config.allCustomObjects) {
      config.objects = [
        'Lead',
        'Account',
        'Contact',
        'Opportunity'
      ];
    }
  } else {
    config.allCustomObjects = false;
    // If an array is passed to the module
    if (Array.isArray(config.sobjects)) {
      config.objects = config.sobjects;
    } else {
      // Check and parse standObjects string for command-line
      try {
        config.objects = config.sobjects.split(',');
      } catch (e) {
        let errorMessage = 'Unable to parse sobjects parameter';
        if (config.debug)
          errorMessage += ' : ' + e;
        throw new Error(errorMessage);
      }
    }
  }


  if (typeof config.techFieldPrefix === 'undefined' || config.techFieldPrefix === null) {
    config.techFieldPrefix = 'TECH_';
  }
  if (typeof config.hideTechFields === 'undefined' || config.hideTechFields === null) {
    config.hideTechFields = false;
  }
  if (typeof config.columns === 'undefined' || config.columns === null) {
    config.columns = {
      'ReadOnly': 5,
      'Mandatory': 3,
      'Name': 25,
      'Description': 90,
      'Helptext': 90,
      'APIName': 25,
      'Type': 27,
      'Values': 45
    };
  }

  var utils = new Utils();

  // Clean folders that contain API files
  if (config.cleanFolders) {
    const statusRmDescribe = utils.rmDir(__dirname + '/files/describe', '.json', false);
    logger('File folders cleaned');
  }

  // Main promise
  const promise = new Promise((resolve, reject) => {
    try {
      if (config.output !== '.') {
        ChildProcess.execFileSync('mkdir',
        [
          '-p', config.output
        ]);
      }
      // Salesforce connection
      logger('Authenticating to/as ' + config.username)
      if (config.debug) {
        utils.log('Authenticated to/as ' + config.username, config);
      }
      if (config.allCustomObjects) {
        let globalDescribeJSON = ChildProcess.execFileSync('sfdx',
          ['dtq:rest',
              '-u', config.username,
              '-e', '/services/data/v51.0/sobjects'
          ]);
        let globalDescribe = JSON.parse(globalDescribeJSON);
        for (let i = 0; i < globalDescribe.sobjects.length; i++) {
          let object = globalDescribe.sobjects[i];
          if (config.objects === undefined)
            config.objects = [];

          // If the sObject is a real custom object
          if (object.custom && (object.name.indexOf('__c') !== -1)) {
            if (config.debug)
              utils.log('# excludeManagedPackage (' + config.excludeManagedPackage + '): ' + object.name, config);

            if (config.excludeManagedPackage) {
              if ((object.name.split('__').length - 1 < 2))
                config.objects.push(object.name);
            } else {
              config.objects.push(object.name);
            }
          }
        }

        if (config.debug)
          utils.log(JSON.stringify(config.objects), config);

        const downloader = new Downloader(config, logger);
        const builder = new ExcelBuilder(config, logger);

        // Download metadata files
        downloader.execute().then(result => {
          logger(result + ' downloaded');
          // Generate the excel file
          builder.generate().then(result => {
            resolve();
          });
        })
      } else {
        if (config.objects.length > 0) {
          const downloader = new Downloader(config, logger);
          const builder = new ExcelBuilder(config, logger);

          // Download metadata files
          downloader.execute().then(result => {
            logger(result + ' downloaded');
            // Generate the excel file
            return builder.generate();

          }).then(result => {
            resolve();
          });

        }
      }
    } catch(err) {
      reject();
    }
  });
  return promise;
};
