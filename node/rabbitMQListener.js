const amqp = require("amqplib");

const open = amqp.connect("amqp://localhost");

const queueName = "my-queue";

const BATCH_SIZE = 5;

let database = [];

// Consumer
open
  .then(async conn => {
    const channel = await conn.createChannel();
    channel.prefetch(BATCH_SIZE);
    await channel.assertQueue(queueName);
    channel.consume(queueName, async msg => {
      console.log('consuming');
      if (msg !== null) {
        database.push(msg);
        if (database.length < BATCH_SIZE) {
          console.log(
            `Received message: ${JSON.stringify({
              msg: msg.content.toString(),
              timestamp: Date.now()
            })}`
          );
        } else {
          console.log('processing');
          console.log(`Processed messages ${database.reduce((acc, cur) => `${acc} ${cur.fields.deliveryTag}`, '')}`);
          database = [];
          channel.ack(msg, true);
        }
      }
    });
  })
  .catch(console.warn);