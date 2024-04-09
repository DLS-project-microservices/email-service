export default interface Email {
    to: string;
    content: {
        subject: string;
        text: string;
    }
}