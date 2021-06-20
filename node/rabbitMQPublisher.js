const amqp = require('amqplib');

const open = amqp.connect('amqp://localhost');

const queueName = 'my-queue';

const message = process.argv[2] || 'no message given';

// Publisher
open
  .then(async conn => {
    const channel = await conn.createChannel();
    const ok = await channel.assertQueue(queueName);
    console.log(ok);
    channel.sendToQueue(queueName, Buffer.from(message));
    await channel.close();
    await conn.close();
    process.exit(0);
  })
  .catch(console.warn);