/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

const level = require('level');

class Persistence {
  constructor(dbName){
    this.db = level(dbName);
  }

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

  getLevelDBData(key) {
    return new Promise((resolve, reject) => {
      this.db.get(key, (err, value) => {
        if(err) { 
          reject(err);
          console.log('Not found!', err);
        }
        resolve(value);
      });
    });
  }

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
           this.addLevelDBData(key, value).then( resolved => resolve("success!")).catch(error => {
             reject(error);
           });
        });
      });
  }
}


// Add data to levelDB with value


/* ===== Testing ==============================================================|
|  - Self-invoking function to add blocks to chain                             |
|  - Learn more:                                                               |
|   https://scottiestech.info/2014/07/01/javascript-fun-looping-with-a-delay/  |
|                                                                              |
|  * 100 Milliseconds loop = 36,000 blocks per hour                            |
|     (13.89 hours for 500,000 blocks)                                         |
|    Bitcoin blockchain adds 8640 blocks per day                               |
|     ( new block every 10 minutes )                                           |
|  ===========================================================================*/
module.exports = Persistence;

