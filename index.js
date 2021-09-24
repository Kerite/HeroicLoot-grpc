require('dotenv').config();

const express = require('express');
const fs = require('fs');
const web3js = require('web3');
const Tx = require('@ethereumjs/tx');

const app = express();
const web3 = new web3js(new web3js.providers.HttpProvider('https://rpc-mumbai.maticvigil.com'));

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractAbi = readFileSync('./erc20/build/contracts/Bitspawn.json');
const contract = new web3.eth.Contract(JSON.parse(contractAbi), contractAddress);

async function signTransaction(contractMethod, fromAddress, toAddress, nonceNum) {
  const rawTransaction = {
    from: fromAddress,
    nonce: web3.util.toHex(nonceNum),
    gasLimit: web3.util.toHex(6000000),
    gasPrice: web3.util.toHex(10e9),
    to: toAddress,
    value: web3.util.toHex(0),
    data: contractMethod.encodeAbi(),
    chainId: 80001, // 4:Rinkeby, 3:Ropsten, 1:mainnet, 80001:polygon testnet
  };
  const tx = new Tx(rawTransaction);
  tx.sign(process.env.PRIV_KEY);
  const serializedTx = tx.serialize();
  const receipt = await web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`);
}

app.get('/balanceOf', (req, res) => {

});

app.get('/mint', (req, res) => {

});

app.get('/transfer', (req, res) => {

});

app.listen(8080);
