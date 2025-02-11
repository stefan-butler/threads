import OpenAI from "openai";
import dotenv from "dotenv";
import path from 'path';
import fs from "fs";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

async function generateEmbedding (text) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
      console.error("Error generating embedding: ", error);
  }
}

const threadsDir  = "./"
async function processSlackFiles () {
  const threads = fs.readdirSync("./").filter(file => file.includes("slack_thread") );

  const threadEmbeddings = [];

  for (const file of threads) {
    const filePath = path.join(threadsDir, file);
    const content = fs.readFileSync(filePath, "utf-8");

    const embedding = await generateEmbedding(content);
    threadEmbeddings.push({file, content, embedding});
  }

  fs.writeFileSync("slack_thread_embeddings.json", JSON.stringify(threadEmbeddings));
}

processSlackFiles();