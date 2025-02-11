import dotenv from "dotenv";
import axios from "axios";

dotenv.config();


//env 
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL_ID= process.env.CHANNEL_ID;

async function fetchMessages () {
  try {
    const response = await axios.get("https://slack.com/api/conversations.history", {
      headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
      params: { channel: CHANNEL_ID},
    });

    const messages = response.data.messages || [];
    return messages.reverse();
    
  } catch (error) {
      console.error("Error fetching messages", error);
      return [];
  }
}

async function fetchThreadMessages (thread_ts) {
  try {
    const response = await axios.get("https://slack.com/api/conversations.replies", {
      headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
      params: { channel: CHANNEL_ID, ts: thread_ts },
    })

    return response.data.messages || [];
    
  } catch (error) {
      console.error("Error fetching threads", error);
      return [];
  }
}

export default async function fetchAllMessagesWithThreads () {
  const messages = await fetchMessages();
  const allMessages = [];

  for (const msg of messages) {
    const messageData = {
      text: msg.text,
      ts: msg.ts,
      user: msg.user,
      thread: []
    }
    if (msg.thread_ts) {
      const threadMessages = await fetchThreadMessages(msg.thread_ts);
      messageData.thread = threadMessages.map(reply => ({
        text: reply.text,
        ts: reply.ts,
        user: reply.user
      }));
    }

    allMessages.push(messageData);
  };

  return allMessages;
}
