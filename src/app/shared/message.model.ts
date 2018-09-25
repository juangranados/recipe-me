export interface Message {
    messageType: MessageType;
    messageContent: string;
}
export enum MessageType {
    Success = 0,
    Error = 1
}
