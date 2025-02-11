import openai from "openai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openAIClient = new openai.OpenAI({ apiKey: OPENAI_API_KEY });


const threadEmbeddings = JSON.parse(fs.readFileSync("slack_thread_embeddings.json"));

//cosine similarity 
function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
      throw new Error("Vectors must be of the same length");
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) {
      return 0; // Avoid division by zero; similarity is undefined in this case
  }

  return dotProduct / (magnitudeA * magnitudeB);
}

async function findPrevResponse(textInput) {
  try {
    const response = await openAIClient.embeddings.create({
      model: "text-embedding-ada-002",
      input: textInput,
    });

    const inputEmbedding = response.data[0].embedding;

    let bestMatch = null;
    let highestSimilarity = -1;

    for (const thread of threadEmbeddings) {
      const similarity = cosineSimilarity(inputEmbedding, thread.embedding);

      if (similarity > highestSimilarity ) {
        highestSimilarity = similarity;
        bestMatch = thread;
      }
    }

    const answer = bestMatch.content.split("\n");
    let answerLine = null;
    highestSimilarity = -1;

    for (const line of answer) {
      console.log("line:  " +line);
      if (line.trim() === "") continue;

      const answerLineResponse = await openAIClient.embeddings.create({
        model: "text-embedding-ada-002",
        input: line,
      });

      // const answerEmbedding = response.data[0].embedding; - OLD LINE
      const answerEmbedding = answerLine.data[0].embedding;
      const answerSimilarity = cosineSimilarity(inputEmbedding, answerEmbedding);

      if (answerSimilarity > highestSimilarity) {
        highestSimilarity = answerSimilarity;
        answerLine = line;
      }
    }

    console.log(answerLine);
    return answerLine;

  } catch (error) {
      console.error("Error generating openAI response:  ", error)
  }
}

findPrevResponse("what is the answer")
