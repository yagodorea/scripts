const os = require('os');
const cluster = require('cluster');
var express = require("express");

async function prettyBigCalculation() {
  let sum = 0;
  const arr = [];
  for (let i = 0; i < 1000000; i++) {
    let y = Math.pow(2 + 2 * Math.random(), 2);
    y = y / 7 - 1;
    arr.push(y);
    sum += y;
  }

  await new Promise(resolve => setTimeout(resolve, 10));
  let sumsq = arr.map(n => Math.pow(n, 2)).reduce((sum, cur) => sum + cur, 0);
  await new Promise(resolve => setTimeout(resolve, 10));
  sumsq = arr.map(n => Math.pow(n, 2)).reduce((sum, cur) => sum + cur, 0);
  await new Promise(resolve => setTimeout(resolve, 10));
  sumsq = arr.map(n => Math.pow(n, 3)).reduce((sum, cur) => sum + cur, 0);
  await new Promise(resolve => setTimeout(resolve, 10));
  sumsq = arr.map(n => Math.pow(n, 4)).reduce((sum, cur) => sum + cur, 0);
  await new Promise(resolve => setTimeout(resolve, 10));
  sumsq = arr.map(n => Math.pow(n, 5)).reduce((sum, cur) => sum + cur, 0);
}

if (cluster.isMaster) {
  const cpus = os.cpus().length;
  console.log(`Forking for ${cpus} CPUs`);
  console.log(`To call this server multiple times really fast you can do this:\nfor i in {1..100}; do curl -XPOST http://localhost:9999 -H "i:$i" & echo "."; done`);
  console.log("!!!\nBe careful! This'll draw all the juice from your processing cores!!!\n!!!");
  for (let i = 0; i < cpus; i++) {
    cluster.fork();
  }
} else {
  var app = express();

  const times = [];
  const transactions = [];
  const logTransactions = () => {
    console.log(`Process ${process.pid}`, transactions.length, 'transactions');
    setTimeout(() => {
      logTransactions();
    }, 1000);
  };
  // logTransactions();

  app.listen(9999, () => console.log(`Process ${process.pid}: Running at http//localhost:9999`));

  app.post("/", async (req, res) => {
    transactions.push(true);
    // Send request id on header 'i'
    console.time(`[${process.pid}] requestTime ${req.header('i')}`);
    const t0 = process.hrtime();

    try {
      await prettyBigCalculation();

      res
        .status(200)
        .header("Content-type", "application/json")
        .send({ message: "processing completed" });
    } catch (e) {
      console.log(e);
      console.log(req.body);
    } finally {
      const t1 = process.hrtime();
      console.timeEnd(`[${process.pid}] requestTime ${req.header('i')}`);
      times.push((t1[0] * 1000 + t1[1] / 1000000) - (t0[0] * 1000 + t0[1] / 1000000));
      console.log(`[${process.pid}] Avg time: ${times.reduce((sum, cur) => cur + sum, 0) / times.length} ms`);
      transactions.pop();
    }
  });
}