export type Message = {
  id: number;
  sender:Sender;
  text: string;
  datetime: string;
};

type Sender = {
  name: "assistant" | "user";
};
  

export type Conversation = {
  id: number;
  title: string;
  messages: Message[];
  last_update:string
};

