require("dotenv").config();
const cron = require("node-cron");
const express = require("express");
const ethers = require("ethers");

/* 
RevaChef address:
https://bscscan.com/address/0xd7550285532f1642511b16Df858546F2593d638B#readProxyContract
->
https://bscscan.com/address/0x5ad9b8732ee6745ba6b73ba51e3495b1f18d00d0#code
*/
const revaChefAbi = require('../abi/RevaChef.json');

const providerUrl = process.env.PROVIDER_URL;
const privateKey = process.env.PRIVATE_KEY;
const revaChef = process.env.REVA_CHEF;

if (!providerUrl) throw new Error("Missing env var PROVIDER_URL");
if (!privateKey) throw new Error("Missing env var PRIVATE_KEY");
if (!revaChef) throw new Error("Missing env var REVA_CHEF");

const provider = new ethers.providers.JsonRpcProvider(providerUrl);
const wallet = new ethers.Wallet(privateKey, provider);

const app = express();

 // Creating a cron job which runs every 12 hours
 // "*/5 * * * * *" - 5 seconds
cron.schedule("0 0 */12 * * *", async function() {
    await updateAllTvls();
});

async function updateAllTvls() {
    console.log("Updating all TVLs");
    const revaChefContract = new ethers.Contract(revaChef, revaChefAbi, wallet);
    try {
        const tx = await revaChefContract.updateAllTvls();
        console.log(`tx data ${JSON.stringify(tx, null, 2)}`);
        const receipt = await tx.wait();
        if (receipt) {
            //console.log(`receipt ${JSON.stringify(receipt, null, 2)}`);
            console.log("transaction confirmed!");
        }
        else {
            console.error("transaction not confirmed!");
        }        
    } catch(e) {
        console.error("error updating TVLs");
        console.error(e.message);
    } 
}


app.listen(process.env.PORT || 5000, async function() {
    console.log(`tvlupdater app listening at http://localhost:${process.env.PORT || 5000}`);
});
