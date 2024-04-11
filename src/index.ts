import 'dotenv/config';
import client, { Connection, Channel, ConsumeMessage } from 'amqplib';
import sendMail from './services/email.js';

try {
    console.log('Establishing connection to RabbitMQ...')
    const connection: Connection = await client.connect(`amqp://${process.env.AMQP_HOST}`);

    const channel: Channel = await connection.createChannel();
    const exchange = 'user';
    await channel.assertExchange(exchange, 'fanout', {
        durable: true
    })

    const queue = await channel.assertQueue('', {
        exclusive: true
    });
    await channel.prefetch(1);
    await channel.bindQueue(queue.queue, exchange, 'user change');
    await channel.consume(queue.queue, async (msg: ConsumeMessage | null) => {
        if(msg?.content) {
            const message = JSON.parse(msg.content.toString());
            console.log(message);

            await sendMail({
                to: message.user.email,
                content: {
                    subject: `Welcome ${message.user.firstName}!`,
                    text: `Welcome to the webshop ${message.user.firstName}.`
                }
            })
            channel.ack(msg);
        }
    })

    console.log(`Connection to RabbitMQ exchange "${exchange}" established.`)
}
catch(error) {
    console.log(error);
}