/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/

const SHA256 = require('crypto-js/sha256');
const Persistence = require('./levelSandbox');

/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block{
	constructor(data){
     this.hash = "",
     this.height = 0,
     this.body = data,
     this.time = 0,
     this.previousBlockHash = ""
    }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain{
  constructor(){
    this.chain = new Persistence('chaindata');
    this.getBlockHeight().then((height) => {
      if (height === -1) {
        this.addBlock(new Block("Kostas Genesis")).then(() => console.log("Genesis block was added to the SimpleChain"))
      } else {
        console.log(`genesis block was already added. Height is: ${height}`);
      }
    });
  }

  // Add new block
  async addBlock(newBlock){
    const currentHeight = parseInt(await this.getBlockHeight());
    console.log('current height:', currentHeight);
    
    newBlock.height = currentHeight + 1;
    newBlock.time = new Date().getTime().toString().slice(0,-3);
    if(currentHeight >= 0){
      let previousBlock = await this.getBlock(currentHeight);
      console.log('previousBlock', previousBlock);
      const previousHash = previousBlock.hash;
      newBlock.previousBlockHash = previousBlock.hash;
      console.log('previousHash', newBlock.previousBlockHash);
    } else {
      console.log('Genesis block!');
    }
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    return this.chain.addDataToLevelDB(newBlock.height, JSON.stringify(newBlock)); 
  }

  // Get block height
    async getBlockHeight(){
      return await this.chain.getLength();
    }

    // get block
    async getBlock(blockHeight){
      return JSON.parse(await this.chain.getLevelDBData(blockHeight))
    }

    // validate block
    async validateBlock(blockHeight){
      let block = await this.getBlock(blockHeight);
      const actualBlockHash = block.hash;    
      block.hash = '';
      const validHash = SHA256(JSON.stringify(block)).toString();
      if (actualBlockHash === validHash) {
        return true;
      } else {
        console.log(`Block #${blockHeight} invalid hash: ${actualBlockHash} is not ${validHash} as it should!`);
        return false;
      }
    }

   // Validate blockchain
    async validateChain(){
      let errorLog = [];
      const chainHeight = await this.getBlockHeight();
      let previousHash = '';
      console.log('chainHeight is:', chainHeight);

      for (let i = 0; i < chainHeight; i++) {
        // validate block
        const block = await this.getBlock(i);
        const validated = await this.validateBlock(block.height);

        if (!validated) {
          errorLog.push(i);
        } 

        if(block.previousBlockHash !== previousHash) {
          console.log('issue with block #', block.height);
          console.log('block previous hash:', block.previousBlockHash);
          console.log('expected from previous:', previousHash);
          erroLog.push(i);
          // console.log('error');
        }

        previousHash = block.hash; 

        if (i == (chainHeight - 1)) {
          if (errorLog.length>0) {
            console.log('Block errors = ' + errorLog.length);
            console.log('Blocks: '+errorLog);
          } else {
            console.log('No errors detected');
          }
        }
      }
      
      
    }
}

let blockchain = new Blockchain();

(function theLoop (i) {
  setTimeout(() => {
    blockchain.addBlock(new Block(`Test data ${i}`)).then(() => {
      if (--i) {
        theLoop(i)
      }
    })
  }, 100);
})(10);

setTimeout(() => blockchain.validateChain(), 2000)
