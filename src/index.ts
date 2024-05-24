import 'dotenv/config';
import sendMail from './services/email.js';
import { consumeUserCreated } from './messages/users.js';
import { consumeOrderStarted, consumeOrderFailed } from './messages/orders.js';
import { consumeShipmentSent } from './messages/shipment.js';

await consumeUserCreated(sendMail);
await consumeOrderStarted(sendMail);
await consumeOrderFailed(sendMail);
await consumeShipmentSent(sendMail);


