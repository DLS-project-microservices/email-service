import { Channel, ConsumeMessage } from 'amqplib';
import connectToRabbitMQ from './connection.js';
import Email from '../types/Email.js';

const exchange = 'order_fanout';
const queueName  = 'email_service_consume_shipment_sent';

async function consumeShipmentSent(): Promise<void> {
    const queueName = "order_service_consume_shipment_sent";
    try {
        const channel: Channel = await connectToRabbitMQ();

        await channel.assertQueue(queueName, {
            durable: true
        });
        channel.bindQueue(queueName, 'order_fanout', 'shipment sent');

        console.log('Waiting for shipment_sent events...');

        channel.consume(queueName, async (msg) => {
            if (msg?.content) {
                const messageContent = JSON.parse(msg.content.toString());
                console.log(messageContent);
                console.log('shipment_sent event processed successfully');
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