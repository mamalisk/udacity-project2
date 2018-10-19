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
    "data": "string content of the block"
}`

If any of the above rules is violated the JSON of the relevant error is return with code 400 ()

Successful creation of a block should return it's JSON representation, e.g.:

`
    {
        "hash": "b6afcadfe1005010bf0350896ed8c44f295eb4e85c00d2e0d952f28324009126",
        "height": 52,
        "body": "the body of the block...",
        "time": "1540038851",
        "previousBlockHash": "48e20f3a3319321d3414c04e6d4b5736a822e3d04aa84e392ae44734d3f61fcb"
    }
`