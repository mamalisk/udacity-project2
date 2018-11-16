# Private Blockchain - with RESTful support
A sample project utilizing `leveldb` and `express` to demonstrate

## Getting Started

## Prerequisites
Make sure you have `node` and `npm` installed.

## Usage
_Installing_

`npm install`

_Producing the distribution (aka lib/ folder)_

`npm run build`

The latter step enables the transpilation from es6 onto an es5 distribution in the `/lib` directory.

## Node JS Framework

I decided to use Express JS (version 4.16.4) due to its simplicity and the ability to separate the server setup from the app configuration and the route definition. Therefore, separate files were created for these 3 concepts which enables better testability of the code.

## Start/Use the service

If you want to start on the default port (8000) then run the following:

`npm start`

A custom port can be used instead by running:

`PORT=8001 npm start`


## API Documentation

* **GET** `/block/<id>` where `id` is the block height, will return the JSON of the respective block from the blockchain provided it exists. Otherwise, a relevant error message is returned in JSON format.

Example response:
`
   {
        "hash": "e0fab9216d2e0ee3f58b10ec897c4580e7e688f71c5acbc9800c65f1fb1f20fa",
        "height": 32,
        "body": "t",
        "time": "1539966370",
        "previousBlockHash": "ba0d42f2acd6c36c9fdee984702c0d99a7986bf1dce90ae294b7868e46cee83c"
    } 
`

* **POST** `/block/` should create a new block if the payload exists and it has the following format:

` {
  "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
      "star": {
              "dec": "68° 52' 56.9",
              "ra": "16h 29m 1.0s",
              "story": "Found star using https://www.google.com/sky/"
          }
  }`

If any of the above rules is violated the JSON of the relevant error is return with code 400 ()

Successful creation of a block should return its JSON representation, e.g.:

`
    {
         "hash": "a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f",
          "height": 1,
          "body": {
               "address": "142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ",
               "star": {
                    "ra": "16h 29m 1.0s",
                    "dec": "-26° 29' 24.9",
                    "story": 
            "466f756e642073746172207573696e672068747470733a2f2f7777772e676f6f676c652e636f6d2f736b792f",
                    "storyDecoded": "Found star using https://www.google.com/sky/"
                 }
           },
          "time": "1532296234",
           "previousBlockHash": "49cce61ec3e6ae664514d5fa5722d86069cf981318fc303750ce66032d0acff3"
    }
`

* **GET** `/block/{height}` returns a block given its height along with the star story decoded

* **GET** `/stars/{:option}` :

if `option: hash:<hash>` then the block with the specified hash is returned.
if `option: address:<address>` then the block with the specified wallet address in body is returned.

* **POST** `/requestValidation` creates a new request given a valid address:

the payload is: 

` {
  "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL"
  }
`

and response is:

`
{
    "walletAddress": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "requestTimeStamp": "1541605128",
    "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1541605128:starRegistry",
    "validationWindow": 300
}`

* **POST** `/message-signature/validate` validates a message given a specific address and a signature

upon successful request a response as follows is returned:

`
{
    "registerStar": true,
    "status": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "requestTimeStamp": "1541605128",
        "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1541605128:starRegistry",
        "validationWindow": 1760,
        "messageSignature": true
    }
}
`


