import client, { Channel } from "amqplib";

let channel: Channel;

async function connectToRabbitMQ(): Promise<Channel> {
if (!channel) {
    console.log('Establishing connection to RabbitMQ...')
    const connection = await client.connect(`amqp://${process.env.AMQP_HOST}`);
    channel = await connection.createChannel();
    console.log('Connection to RabbitMQ established.')
}

return channel;
}

export default connectToRabbitMQ;


    