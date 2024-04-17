import { Channel, ConsumeMessage } from 'amqplib';
import connectToRabbitMQ from './connection.js';
import Email from '../types/Email.js';

const exchange = 'order';
const queueName  = 'email_service_order';

async function consumeOrderStarted(handlerFunction: (email: Email) => Promise<void>) {
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
                await handlerFunction({
                    to: message.customer.email,
                    content: {
                            subject: `Thanks for the order, ${message.customer.firstName}!`,
                            text: `Thanks for ordering stuff, ${message.customer.firstName}.`
                        }
                    })
            
                channel.ack(msg);
            }
        }, { 
            noAck: false 
        })
    
        console.log(`Connection to RabbitMQ exchange "${exchange}" established. \nListening for "order started" events...`)
    }
    catch(error) {
        console.log(error);
    }
    
}

export {
    consumeOrderStarted
}
