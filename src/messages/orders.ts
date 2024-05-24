import { Channel, ConsumeMessage } from 'amqplib';
import { connectToRabbitMQ } from 'amqplib-retry-wrapper-dls';
import Email from '../types/Email.js';

const exchange = 'order_fanout';
const failExchange = 'order_direct';
const queueName  = 'email_service_order';
const failQueue = "email_service_order_failed"

const channel: Channel = await connectToRabbitMQ(process.env.AMQP_HOST);

async function consumeOrderStarted(handlerFunction: (email: Email) => Promise<void>) {
    try {
        await channel.assertExchange(exchange, 'fanout', {
            durable: true
        });

        await channel.assertQueue(queueName, {
            durable: true,
        });
        await channel.prefetch(1);
        await channel.bindQueue(queueName, exchange, '');
        await channel.consume(queueName, async (msg: ConsumeMessage | null) => {
            if(msg?.content) {
                const message = JSON.parse(msg.content.toString());
                console.log(message);

                // productDefailts and joinedString is just an example to test it
                const productDetails = message.orderLineItems.map((item: any) => {
                    return `ID: ${item.productId}, Quantity: ${item.quantity}, Total price: ${item.totalPrice}`
                });

                const joinedString = `Order Number: ${message.orderNumber}\n${productDetails.join('\n')}\nTotal Price: ${message.totalPrice}`

                await handlerFunction({
                    to: message.customer.email,
                    content: {
                        // TODO: find out how the email should look like.
                        subject: `Thanks for the order, ${message.customer.firstName}!`,
                        text: joinedString
                    }
                });

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

async function consumeOrderFailed(handlerFunction: (email: Email) => Promise<void>) {
    try {
        await channel.assertExchange(failExchange, 'direct', {
            durable: true
        });

        await channel.assertQueue(failQueue, {
            durable: true,
        });
        await channel.prefetch(1);
        await channel.bindQueue(failQueue, failExchange, 'order failed');
        await channel.consume(failQueue, async (msg: ConsumeMessage | null) => {
            if(msg?.content) {
                const message = JSON.parse(msg.content.toString());
                console.log(message);

                await handlerFunction({
                    to: message.customer.email,
                    content: {
                        subject: `Uh oh! Your order failed to be registrered, ${message.customer.firstName}`,
                        text: `If you've recieved this mail, an error in our system has occured.
                        Please contact our support team.\n\n
                        Best regards, DLS-Project Company\n`
                    }
                });
                channel.ack(msg);
            }
        }, {
            noAck: false
        })
        console.log(`Connection to RabbitMQ exchange "${failExchange}" established. \nListening for "order failed" events...`)
    }
    catch(error) {
        console.log(error);
    }
}

export {
    consumeOrderStarted,
    consumeOrderFailed
}
