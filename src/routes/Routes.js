const Blockchain = require("../blockchain");
const Block = require("../models/block");
const blockchain = new Blockchain();

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
        app.get('/block/:id', (req, res) => { 
            blockchain.getBlock(req.params.id).then(block => {
                res.set('cache-control', 'no-cache')
                res.json(block);
            }).catch (error => {
                res.status(404);
                res.set('cache-control', 'no-cache');
                res.json({
                    message: `block ${req.params.id} not found`,
                });
            });
        });

        // Create new block endpoint
        app.post('/block', (req, res) => { 
            if(!req.body || !req.body.data) {
                res.status(400);
                res.set('cache-control', 'no-cache');
                res.json({
                    message: 'Error! no block specified.'
                })
            } else {
                blockchain.addBlock(new Block(req.body.data)).then( block => {
                    res.status(200);
                    res.set('cache-control', 'no-cache');
                    res.json(JSON.parse(block));
                });
            }
        })
    }
}

module.exports = Routes;