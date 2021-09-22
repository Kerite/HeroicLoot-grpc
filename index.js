require('dotenv').config();

var express = require('express');
var fs = require('fs');
var web3js = require('web3');

var app = express();
var web3 = new web3js(new web3js.providers.HttpProvider('https://rpc-mumbai.maticvigil.com'));

var contracts = process.env.CONTRACT_ADDRESS
var contractAbi = readFileSync('./erc20/build/contracts/Bitspawn.json');

app.get('/balanceOf', function (req) {

})
