require('dotenv').config();

var express = require('express');
var fs = require('fs');
var web3js = require('web3');

var app = express();
var web3 = new web3js(new web3js.providers.HttpProvider('https://rpc-mumbai.maticvigil.com'));

var contractAddress = process.env.CONTRACT_ADDRESS
var contractAbi = readFileSync('./erc20/build/contracts/Bitspawn.json');
const contract = new web3.eth.Contract(JSON.parse(contractAbi), contractAddress)

async function signTransaction(fromAddress, toAddress, nonceNum, privKey) {
    var rawTransaction = {
        from: fromAddress,
        nonce: web3.util.toHex(nonceNum),
        gasLimit: web3.util.toHex(6000000),
        gasPrice: web3.util.toHex(10e9),
        to: toAddress,
        value: web3.util.toHex(0),
        data: ,
        chainId: 80001//4:Rinkeby, 3:Ropsten, 1:mainnet, 80001:polygon testnet
    }
}

app.get('/balanceOf', function (req, res) {

})

app.get('/mint', function (req, res) {

})

app.get('/transfer', function (req, res) {

})

app.listen(8080);
