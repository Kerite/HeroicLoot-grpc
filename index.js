require('dotenv').config();

const express = require('express');
const fs = require('fs');
const Web3 = require('web3');
const Tx = require('@ethereumjs/tx');
const jwt = require('express-jwt');

const app = express();
const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com'));

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractAbi = JSON.parse(fs.readFileSync('./erc20/build/contracts/Bitspawn.json'));

async function signTransaction(contractMethod, fromAddress, contractAddress, nonceNum) {
  const rawTransaction = {
    from: fromAddress,
    nonce: web3.util.toHex(nonceNum),
    gasLimit: web3.util.toHex(6000000),
    gasPrice: web3.util.toHex(10e9),
    to: contractAddress,
    value: web3.util.toHex(0),
    data: contractMethod.encodeAbi(),
    chainId: 80001, // 4:Rinkeby, 3:Ropsten, 1:mainnet, 80001:polygon testnet
  };
  const tx = new Tx(rawTransaction);
  tx.sign(process.env.PRIV_KEY);
  const serializedTx = tx.serialize();
  const receipt = await web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`);
}

// 全局使用 jwt 中间件
const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_FILE);
app.use(jwt({ secret: publicKey, algorithms: ['RS256'] }))
// 例外列表
  .unless({ path: ['/token'] });

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).send('invalid token...');
  }
});

app.get('/balanceOf', (req, res) => {
  const fromAddress = req.headers.authorization;
  const contract = new web3.eth.Contract(contractAbi, contractAddress, {
    from: fromAddress,
  });
  signTransaction(contract.methods.balanceOf(), fromAddress);
});

app.get('/mint', (req, res) => {

});

app.get('/transfer', (req, res) => {

});

app.listen(8080);
