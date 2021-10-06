require('dotenv').config();

const express = require('express');
const fs = require('fs');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
// const jwt = require('express-jwt');

const app = express();
const web3 = new Web3(new Web3.providers.HttpProvider('https://rpc-mumbai.maticvigil.com'));

const contractAddress = process.env.CONTRACT_ADDRESS;
const contractAbi = JSON.parse(fs.readFileSync('./erc20/script/abi/Bitspawn.json', 'utf-8'));
const erc20Abi = JSON.parse(fs.readFileSync('./erc20/script/abi/Bitspawn.json', 'utf-8'));

function createContractObj() {
  const contract = new web3.eth.Contract(contractAbi, contractAddress);
  return contract;
}

function createAdminContractObj() {
  const contract = new web3.eth.Contract(contractAbi, erc20Abi, {
    from: process.env.ADMIN_ADDRESS,
  });
  return contract;
}

async function signAndSendTransaction(contractMethod, fromAddress) {
  const nonceCnt = await web3.eth.getTransactionCount(fromAddress);
  console.log(`num transactions so far: ${nonceCnt}`);

  // TODO getPrivKey
  const privKey = Buffer.from(process.env.PRIV_KEY, 'hex');

  const rawTransaction = {
    nonce: web3.utils.toHex(nonceCnt),
    gasLimit: web3.utils.toHex(6000000),
    gasPrice: web3.utils.toHex(10e9),
    to: contractAddress,
    value: web3.utils.toHex(0),
    data: contractMethod.encodeABI(),
    chainId: 80001, // 4:Rinkeby, 3:Ropsten, 1:mainnet, 80001:polygon testnet
  };
  const tx = new Tx(rawTransaction);
  tx.sign(privKey);
  const serializedTx = tx.serialize();
  const receipt = await web3.eth.sendSignedTransaction(`0x${serializedTx.toString('hex')}`);
  // console.log(`Receipt info:  ${JSON.stringify(receipt, null, '\t')}`);
  return receipt;
}

async function getBalance(contractObj, fromAddress) {
  const myValue = await contractObj.methods.balanceOf(fromAddress).call({ from: fromAddress });
  console.log(`balanceOf: ${fromAddress} : ${myValue}`);
  return myValue;
}

// 全局使用 jwt 中间件
// const publicKey = fs.readFileSync(process.env.PUBLIC_KEY_FILE);
// app.use(jwt({ secret: publicKey, algorithms: ['RS256'] }))
// // 例外列表
//   .unless({ path: ['/token'] });

// app.use((err, req, res, next) => {
//   console.log('error:', err);
//   if (err.name === 'UnauthorizedError') {
//     res.status(401).send('invalid token...');
//   }
// });

app.get('/balanceOf/:fromAddress', (req, res) => {
  const { fromAddress } = req.params;
  const contract = createContractObj();
  // signTransaction(contract.methods.balanceOf(fromAddress), fromAddress);
  getBalance(contract, fromAddress)
    .then((balance) => { res.send(balance); res.end(); })
    .catch((err) => {
      res.send(err.message);
      console.error(err);
      res.end();
    });
});

app.post('/mint/:toAddress', (req, res) => {
  const mintCount = `${1e18}`;
  const { toAddress } = req.params;
  const contractObj = createAdminContractObj();
  signAndSendTransaction(contractObj.methods.mint(toAddress, mintCount), process.env.ADMIN_ADDRESS)
    .then((receipt) => {
      res.send(JSON.stringify(receipt, null, '\t'));
      res.end();
    }).catch((err) => {
      res.send(err.message);
      console.error(err);
      res.end();
    });
});

const port = process.env.PORT || 8080;
app.listen(port, (err) => {
  if (err) console.log('Server start error');
  console.log(`Serve listening on port${port}`);
});
