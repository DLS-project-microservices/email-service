import 'dotenv/config';
import sendMail from './services/email.js';
import { consumeUserCreated } from './messages/users.js';
import { consumeOrderStarted } from './messages/orders.js';

await consumeUserCreated(sendMail);
await consumeOrderStarted(sendMail);


