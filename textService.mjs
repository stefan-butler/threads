import fetchAllMessagesWithThreads from "./fetchMessages.mjs";
import fs from 'fs';

async function convertMessages() {
  const messages = await fetchAllMessagesWithThreads();
  let counter = 1;

  for (const msg of messages) {
    if (msg.thread.length >= 1) {
      const thread = [];
      for (const reply of msg.thread) {
        thread.push(`${reply.user} said: ${reply.text}`);
      }
      const threadToString = thread.join("\n");
      fs.writeFileSync(`slack_thread_${counter}.txt`, threadToString);
      counter ++;
    }
  }
  
;

}

convertMessages();