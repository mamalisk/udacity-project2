/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');

/**
 * Provides an abstraction layer for persistence using 'LevelDB'
 *
 * @class Persistence
 */
class Persistence {
  constructor(dbName){
    this.db = level(dbName);
  }

  /**
   * Adds Data to LevelDB given:
   * @param {string} key 
   * @param {any} value 
   */
  addLevelDBData(key, value) {
    return new Promise((resolve, reject) => {
        this.db.put(key, value, (err) => {
          if(err) { 
            console.log('Block ' + key + ' submission failed', err);
            reject(err);
          }
          resolve("Block successfully added!");
        });
    });
  }

  /**
   * Returns all data stored on LevelDB
   * given:
   * @param {string} key
   * @returns a Promisified array of JSON objects
   * @memberof Persistence
   */
  getLevelDBData(key) {
      console.log('key', key);
    return new Promise((resolve, reject) => {
      this.db.get(key, (err, value) => {
          if(err) {
              if (err.type == 'NotFoundError') {
                  resolve(undefined);
              } else {
                  console.log('Block ' + key + ' get failed', err);
                  reject(err);
              }
          }
          else {
              console.log('resolved!!!');
              resolve(value);
          }
      });
    });
  }

  getByDataAttribute(dataKey, dataValue) {
      let block = null;
      return new Promise((resolve, reject) => {
          this.db.createReadStream().on('data', data =>  {
              if(JSON.parse(data.value)[dataKey] === dataValue) {
                  block = JSON.parse(data.value);
              }
          }).on('error', function(err) {
              reject(err);
          }).on('close', () => resolve(block));
      })
  }

    getAllByBodyAttribute(bodyKey, bodyValue) {
      let blocks = [];
      return new Promise((resolve, reject) => {
          this.db.createReadStream().on('data', data =>  {
              if(JSON.parse(data.value).body[bodyKey] === bodyValue) {
                  blocks.push(JSON.parse(data.value));
              }
              console.log(blocks);
          }).on('error', function(err) {
              console.log('errorita');
              reject(err);
          }).on('close', () => {
              console.log('resolved!');
              resolve(blocks);
          });
      })
  }

  /**
   * @returns a promisified size of the LevelDB
   * @memberof Persistence
   */
  getLength() {
    let i = -1;
    return new Promise((resolve, reject) => {
       this.db.createReadStream().on('data', data => i++)
                                 .on('error', error => reject(error))
                                 .on('close', () => resolve(i))
                          
    });
  }

  addDataToLevelDB(key, value) {
    return new Promise((resolve,reject) => { 
        this.db.createReadStream().on('data', (data) => {}).on('error', (err) => {
            console.log('Unable to read data stream!', err);
            reject(err);
        }).on('close', () => {
           console.log('Block #' + key);
           this.addLevelDBData(key, value).then( resolved => resolve(value)).catch(error => {
             reject(error);
           });
        });
      });
  }
}

module.exports = Persistence;

