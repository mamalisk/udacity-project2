const Blockchain = require("../blockchain");
const Block = require("../models/block");
const Mempool = require("../services/mempool");
const blockchain = new Blockchain();
const hex2ascii = require('hex2ascii');

const toStarStoryDecodedToAscii = (blockObject) => {
    console.log(blockObject);
    const star = {
        ...blockObject.body.star,
        storyDecoded: hex2ascii(blockObject.body.star.story),
    };
    return {
        ...blockObject,
        body: {
            ...blockObject.body,
            star,
        }
    };
};

const isValidStar = (request) => {
    if(!request.star || !request.star.story) return false;

    const existsAndIsString = (param) => param && typeof param === 'string';
    const {story, dec, ra} = request.star;

    const containsInformation = existsAndIsString(dec) && existsAndIsString(ra);

    const isAscii = /^[\x00-\x7F]*$/.test(story);
    return containsInformation && isAscii && new Buffer(story).length <= 500;
};

/**
 * Provides the enrichment method which defines the routes for the provided app
 *
 * @class Routes
 */
class Routes {
    /**
     * Defines the endpoint for {app}
     * @param {Application} app
     */
    static for(app) {

        // get specific block given its height
        app.get('/block/:height', (req, res) => {
            blockchain.getBlockByHeight(req.params.height).then(block => {
                res.status(200);
                res.set('cache-control', 'no-cache');
                console.log(typeof block);
                res.json(toStarStoryDecodedToAscii(block));
            }).catch (error => {
                res.status(404);
                res.set('cache-control', 'no-cache');
                res.json({
                    message: `block with height: ${req.params.height} not found`,
                });
                console.log(error);
            });
        });

        app.get('/stars/:option', (req, res) => {
            const { option } = req.params;
            if(option.startsWith('hash:'))  {
                const hash = option.replace('hash:','');
                blockchain.getBlockByHash(hash).then(block => {
                    res.set('cache-control', 'no-cache');
                    res.json(toStarStoryDecodedToAscii(block));
                }).catch (error => {
                    res.status(404);
                    res.set('cache-control', 'no-cache');
                    res.json({
                        message: `block with hash ${hash} not found`,
                    });
                    console.log(error);
                });
            } else if(option.startsWith('address:')){
                const address = option.replace('address:','');
                blockchain.getBlockByWalletAddress(address).then(blocks => {
                    res.set('cache-control', 'no-cache');
                    res.status(200);
                    res.json(blocks.map(toStarStoryDecodedToAscii));
                    res.json({});
                }).catch (error => {
                    res.status(404);
                    res.set('cache-control', 'no-cache');
                    res.json({
                        message: `block for wallet address: ${address} not found`,
                    });
                    console.log(error);
                });
            } else {
                res.status(500);
                res.set('cache-control', 'no-cache');
                res.json({
                    message: `option ${option} was unknown`,
                });
            }

        });

        // Create new block endpoint
        app.post('/block', (req, res) => {
            if(!req.body || !req.body) {
                res.status(400);
                res.set('cache-control', 'no-cache');
                res.json({
                    message: 'Error! no block specified.'
                })
            } else {

                if(!isValidStar(req.body)){
                    res.status(400);
                    res.set('cache-control', 'no-cache');
                    res.json({
                        message: 'Invalid Star format',
                    });
                    return;
                }

                const encodedBlockData = {
                    address: req.body.address,
                    star: {
                        ra: req.body.star.ra,
                        dec: req.body.star.dec,
                        mag: req.body.star.mag,
                        cen: req.body.star.cen,
                        story: new Buffer(req.body.star.story).toString('hex'),
                    }
                };

                blockchain.addBlock(new Block(encodedBlockData)).then( block => {
                    res.status(201);
                    res.set('cache-control', 'no-cache');
                    res.json(toStarStoryDecodedToAscii(JSON.parse(block)));
                    Mempool.mempool.removeFromMemPool(encodedBlockData.address);
                }).catch(error => {
                    res.status(500);
                    res.json({
                        message: error.message,
                    });
                });
            }
        });

        // Request Validation
        app.post('/requestValidation', (req, res) => {
            if(!req.body || !req.body.address) {
                res.status(400);
                res.set('cache-control', 'no-cache');
                res.json({
                    message: 'Error! no address specified.'
                })
            } else {
                res.status(201);
                res.set('cache-control', 'no-cache');
                res.json(Mempool.mempool.addRequestValidation(req.body.address));
            }
        });

        app.post('/message-signature/validate', (req, res) => {
            if(!req.body || !req.body.address || !req.body.signature ) {
                res.status(400);
                res.set('cache-control', 'no-cache');
                res.json({
                    message: 'Error! wrong request.'
                })
            } else {
                res.status(201);
                res.set('cache-control', 'no-cache');
                res.json(Mempool.mempool.validateRequestByWallet(req.body.address, req.body.signature));
            }
        });
    }
}

module.exports = Routes;