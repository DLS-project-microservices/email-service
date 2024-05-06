import { Channel, ConsumeMessage } from 'amqplib';
import connectToRabbitMQ from './connection.js';
import Email from '../types/Email.js';

const exchange = 'order_fanout';
const queueName  = 'email_service_consume_shipment_sent';

async function consumeShipmentSent(handlerFunction: (email: Email) => Promise<void>) {
    try {
        const channel: Channel = await connectToRabbitMQ();

        await channel.assertQueue(queueName, {
            durable: true
        });
        channel.bindQueue(queueName, exchange, 'shipment sent');

        console.log('Waiting for shipment_sent events...');

        channel.consume(queueName, async (msg) => {
            if (msg?.content) {
                const messageContent = JSON.parse(msg.content.toString());
                console.log(messageContent);
                console.log('shipment_sent event processed successfully');

                await handlerFunction({
                    to: messageContent.customer.email,
                    content: {
                        subject: `Your order is on its way!`,
                        text: `Hello ${messageContent.customer.firstName},\n\n
                        This mail was sendt to you to confirm that order: ${messageContent.orderNumber} has been shipped.\n\n
                        Best regards, DLS-Project Company\n`
                    }
                });

                channel.ack(msg);
            }
        });

    } catch (error) {
        console.error('Error consuming shipment_sent event:', error);
    }
};

export {
    consumeShipmentSent
}