import { HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import type { NextRequest } from "next/server";
import { AuthZService, PangeaConfig } from "pangea-node-sdk";

import { GoogleDriveRetriever } from "@/google";

import { validateToken } from "../requests";

import { getGoogleDriveCredentials } from "@/utils";

const SYSTEM_PROMPT = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are an assistant for question-answering tasks. Use the following pieces of retrieved context to answer the question. If you don't know the answer, just say that the user may not be authorized to know the answer. Use three sentences maximum and keep the answer concise.
Question: {input}
User's first name: {firstName}
User's last name: {lastName}
Context: {context}
Answer:`,
  ],
]);

const retriever = new GoogleDriveRetriever({
  credentials: getGoogleDriveCredentials()!,
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});
const authz = new AuthZService(
  process.env.PANGEA_SERVICE_TOKEN!,
  new PangeaConfig({ domain: process.env.NEXT_PUBLIC_PANGEA_DOMAIN }),
);
const model = new ChatOpenAI({
  model: "gpt-4o",
  maxTokens: 512,
  temperature: 0.5,
});
const chain = SYSTEM_PROMPT.pipe(model).pipe(new StringOutputParser());

interface RequestBody {
  /** Whether or not to apply AuthZ. */
  authz: boolean;

  /** User's prompt. */
  userPrompt: string;
}

export async function POST(request: NextRequest) {
  const { success, username, profile } = await validateToken(request);

  if (!(success && username)) {
    return new Response("Forbidden", { status: 403 });
  }

  const body: RequestBody = await request.json();

  // Get all documents.
  let docs = await retriever.invoke("");

  // Filter documents based on user's permissions in AuthZ.
  if (body.authz) {
    docs = await Promise.all(
      docs.map(async (doc) => {
        const response = await authz.check({
          subject: { type: "user", id: username },
          action: "read",
          resource: { type: "file", id: doc.id },
        });
        return response.result.allowed ? doc : null;
      }),
    ).then((results) => results.filter((doc) => doc !== null));
  }

  const llmReply = await chain.invoke({
    firstName: profile.first_name,
    lastName: profile.last_name,
    context: docs.map((doc) => doc.pageContent).join("\n\n"),
    input: [new HumanMessage(body.userPrompt)],
  });
  return Response.json(llmReply);
}
