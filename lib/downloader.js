const fs = require('fs');
const path = require('path');
const bytes = require('bytes');
const ChildProcess = require('child_process');
const Utils = require('./utils.js');

const FILE_DIR = '../files';

module.exports = class Downloader {
  constructor(config, logger) {
    this.config = config;
    this.logger = logger;
    this.utils = new Utils(logger);
  }

  downloadDescribe(sObject) {
    const self = this;
    return new Promise((resolve, reject) => {
      try {
        let sObjectDescribeRespWithAnsiCodes = ChildProcess.execFileSync('sfdx',
          ['dtq:rest',
              '-u', self.config.username,
              '-e', '/services/data/v51.0/sobjects/' + sObject + '/describe'
          ],
          { encoding: 'utf-8', maxBuffer: 100 * 1024 * 1024 }
        ).toString();
        let sObjectDescribeRespWithAnsiCodesAndJSON = ChildProcess.execFileSync('sfdx',
          ['dtq:rest',
              '-u', self.config.username,
              '-e', '/services/data/v51.0/sobjects/' + sObject + '/describe',
              '--json'
          ],
          { encoding: 'utf-8', maxBuffer: 100 * 1024 * 1024 }
        ).toString();
        let sObjectDescribeRespNoAnsiCodes = sObjectDescribeRespWithAnsiCodes.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        let sObjectDescribeRespNoAnsiCodesWithJSON = sObjectDescribeRespWithAnsiCodesAndJSON.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
        let sObjectDescribeResp = JSON.parse(sObjectDescribeRespNoAnsiCodesWithJSON.replace(sObjectDescribeRespNoAnsiCodes,''));
        const filePath = path.join(__dirname, FILE_DIR, '/describe/', sObject + '.json');
        fs.writeFileSync(filePath, JSON.stringify(sObjectDescribeResp.result), 'utf-8');
        const stats = fs.statSync(filePath);
        resolve(stats.size);
      } catch(err) {
        reject(err);
        console.log(err);
        console.log(err.stack);
      }
    });
  }

  execute() {
    const promise = new Promise((resolve, reject) => {
      const self = this;

      this.logger('Downloading...');

      let downloadArray = new Array();

      for (let object of self.config.objects) {
        downloadArray.push(self.downloadDescribe(object));
      }

      Promise.all(
        downloadArray
      ).then(results => {
        let total = 0;
        for (let fileSize of results) {
          total += fileSize;
        }
        resolve(bytes.format(total, {
          decimalPlaces: 2
        }));
      }).catch(reject);
    });
    return promise;
  }
}
