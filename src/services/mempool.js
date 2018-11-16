const TimeoutRequestsWindowTime = 5*60*1000;
const TimeoutMempoolValidWindowTime = 30*60*1000;
const bitcoinMessage = require('bitcoinjs-message');

class ValidRequest {

    constructor(req){
        const timeElapse = (new Date().getTime().toString().slice(0,-3)) - req.requestTimeStamp;
        const timeLeft = (TimeoutMempoolValidWindowTime/1000) - timeElapse;
        this.registerStar = true;
        this.status = {
            address: req.walletAddress,
            requestTimeStamp: req.requestTimeStamp,
            message: req.message,
            validationWindow: timeLeft,
            messageSignature: true
        }
    }
}

const getTimeLeftFor = (req) => {
    const timeElapse = (new Date().getTime().toString().slice(0,-3)) - req.requestTimeStamp;
    return (TimeoutRequestsWindowTime/1000) - timeElapse;
};

const getMempoolTimeLeft = (validRequest) => {
    const timeElapse = (new Date().getTime().toString().slice(0,-3)) - validRequest.status.requestTimeStamp;
    return (TimeoutMempoolValidWindowTime/1000) - timeElapse;
};

class Mempool {

    constructor(){
        this.mempool = [];
        this.timeoutRequests = [];
        this.mempoolValid = [];
        this.timeoutMempoolValid = [];
    }



    addRequestValidation(walletAddress){
        const foundResults = this.timeoutRequests.filter((request) => walletAddress === request.walletAddress);
        if(foundResults.length > 0) {
            const req = foundResults[0];
            const timeLeft = getTimeLeftFor(req);
            this.removeValidationRequest(req);
            const updatedRequest = {
                ...req,
                validationWindow: timeLeft
            };
            this.timeoutRequests.push(updatedRequest);
            return updatedRequest;
        }
        const requestTimeStamp = new Date().getTime().toString().slice(0,-3);
        const newRequest = {
            walletAddress,
            requestTimeStamp,
            message: `${walletAddress}:${requestTimeStamp}:starRegistry`,
            validationWindow: TimeoutRequestsWindowTime / 1000,
        };
        this.timeoutRequests.push(newRequest);
        this.setTimeoutOn(newRequest);
        return newRequest;
    }

    validateRequestByWallet(walletAddress, signature){
        const found = this.timeoutRequests.filter(req => req.walletAddress === walletAddress);

        const foundExistingInMempool = this.mempoolValid.filter(req => req.status.address === walletAddress);
        if(foundExistingInMempool && foundExistingInMempool.length > 0 && foundExistingInMempool[0].status.validationWindow >= 0) {
            const request = foundExistingInMempool[0];
            const timeLeft = getMempoolTimeLeft(request);
            let status = {...request.status };
            status.validationWindow = timeLeft;
            return {
                ...request,
                status,
            };
        } 
        try {
            const isValid = bitcoinMessage.verify(found[0].message, walletAddress, signature);
            if(!isValid) return {
                registerStar: false,
                message: "Error! Your request was invalid.",
            };
            this.removeValidationRequest(found[0]);
            const validRequest = new ValidRequest(found[0], signature);
            this.mempoolValid.push(validRequest);
            return validRequest;
        } catch (err) {
            return {
                registerStar: false,
                message: err.message,
            }
        }

    }

    verifyAddressRequest(addressRequest){
        const found = this.mempoolValid.filter(req => req.status.address === addressRequest.address);
        if(found && found.length > 0) {
            const timeElapse = (new Date().getTime().toString().slice(0,-3)) - found[0].status.requestTimeStamp;
            const timeLeft = (TimeoutMempoolValidWindowTime/1000) - timeElapse;
            return timeLeft >= 0;
        }
        return false;
    }

    setTimeoutOn(req){
        setTimeout(( )=> {
            this.removeValidationRequest(req);
        }, TimeoutRequestsWindowTime);
    }

    setTimeoutOnValidRequest(req){
        setTimeout(() => {
            this.removeFromMemPool(req.status.address);
        }, TimeoutMempoolValidWindowTime);
    }

    removeValidationRequest(req) {
        this.timeoutRequests = this.timeoutRequests.filter(r => r.walletAddress !== req.walletAddress);
    }

    removeFromMemPool(address) {
        this.mempoolValid = this.mempoolValid.filter(r => r.status.address !== address);
    }
}

const mempool = new Mempool();

module.exports = {
    mempool
};