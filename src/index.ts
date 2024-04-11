import 'dotenv/config';
import sendMail from './services/email.js';
import { consumeUserCreated } from './messages/users.js';

await consumeUserCreated(sendMail);


