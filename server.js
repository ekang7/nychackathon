import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const port = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const resumeInformation = ``;

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/get-response", async (req, res) => {
  try {
    const userMessage = req.body.message;
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: resumeInformation },
        { role: "user", content: userMessage },
      ],
    });

    if (
      chatCompletion.choices &&
      chatCompletion.choices.length > 0 &&
      chatCompletion.choices[0].message
    ) {
      const messageContent = chatCompletion.choices[0].message.content;
      res.json({ answer: messageContent });
    } else {
      throw new Error("No response or unexpected format from OpenAI");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error processing your request");
  }
});

// Construct __dirname in ES module
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Serve static files from a directory named 'public'
app.use(express.static(path.resolve(__dirname, "public")));
// All other GET requests not handled before will return our app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
