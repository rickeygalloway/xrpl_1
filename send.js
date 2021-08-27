
'use strict';
const RippleAPI = require('ripple-lib').RippleAPI;

const api = new RippleAPI({
   //server: 'wss://s1.ripple.com' // Public rippled server
  server: 'wss://s.altnet.rippletest.net:51233' //Test
});

api.connect().then(() => {
  /* begin custom code ------------------------------------ */
  const myAddress = 'raYFT7xps8qKWVZHpGpNMxDAgvpPgJV6Hv';

  console.log('getting account info for', myAddress);
  return api.getAccountInfo(myAddress);

}).then(info => {
  console.log(info);
  console.log('getAccountInfo done');

  /* end custom code -------------------------------------- */
}).catch(console.error);


api.on('connected', async () => {


  // Prepare transaction -------------------------------------------------------
  const preparedTx = await api.prepareTransaction({
    "TransactionType": "Payment",
    "Account": 'raYFT7xps8qKWVZHpGpNMxDAgvpPgJV6Hv',
    "Amount": api.xrpToDrops("10"), // Same as "Amount": "22000000"
    "Destination": "r4vbUV15cmzJWXrqVgC7PtjTNSk5vbxS2N"
  }, {
    // Expire this transaction if it doesn't execute within ~5 minutes:
    "maxLedgerVersionOffset": 75
  })
  const maxLedgerVersion = preparedTx.instructions.maxLedgerVersion
  console.log("Prepared transaction instructions:", preparedTx.txJSON)
  console.log("Transaction cost:", preparedTx.instructions.fee, "XRP")
  console.log("Transaction expires after ledger:", maxLedgerVersion)


// Sign prepared instructions ------------------------------------------------
const signed = api.sign(preparedTx.txJSON, 'snHjb6eZPUFSXp5VRJf9ZsMifwDsr')
const txID = signed.id
const tx_blob = signed.signedTransaction
console.log("Identifying hash:", txID)
console.log("Signed blob:", tx_blob)


// Submit signed blob --------------------------------------------------------
  // The earliest ledger a transaction could appear in is the first ledger
  // after the one that's already validated at the time it's *first* submitted.
  const earliestLedgerVersion = (await api.getLedgerVersion()) + 1
  const result = await api.submit(tx_blob)
  console.log("Tentative result code:", result.resultCode)
  console.log("Tentative result message:", result.resultMessage)

});