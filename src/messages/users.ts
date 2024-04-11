import { Channel, ConsumeMessage } from 'amqplib';
import connectToRabbitMQ from './connection.js';
import Email from '../types/Email.js';

const exchange = 'user';
const queueName  = 'email_service_user_changes';

async function consumeUserCreated(handlerFunction: (email: Email) => Promise<void>) {
    try {
        const channel: Channel = await connectToRabbitMQ();

        await channel.assertExchange(exchange, 'fanout', {
            durable: true
        })
    
        await channel.assertQueue(queueName, {
            durable: true,
        });
        await channel.prefetch(1);
        await channel.bindQueue(queueName, exchange, '');
        await channel.consume(queueName, async (msg: ConsumeMessage | null) => {
            if(msg?.content) {
                const message = JSON.parse(msg.content.toString());
                console.log(message);
    
                if (message.status.toLowerCase() === 'created') {
                    await handlerFunction({
                        to: message.user.email,
                        content: {
                            subject: `Welcome ${message.user.firstName}!`,
                            text: `Welcome to the webshop ${message.user.firstName}.`
                        }
                    })
                }
                channel.ack(msg);
            }
        }, { 
            noAck: false 
        })
    
        console.log(`Connection to RabbitMQ exchange "${exchange}" established. \nListening for "user created" events...`)
    }
    catch(error) {
        console.log(error);
    }
    
}

export {
    consumeUserCreated
}
