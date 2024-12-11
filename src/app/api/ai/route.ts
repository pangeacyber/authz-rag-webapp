import { HumanMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { ChatCloudflareWorkersAI } from "@langchain/cloudflare";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import type { NextRequest } from "next/server";
import { AuthZService, PangeaConfig } from "pangea-node-sdk";

import { GoogleDriveRetriever } from "@/google";
import { getGoogleDriveCredentials } from "@/utils";

import { validateToken } from "../requests";
import { Document } from "@langchain/core/documents";

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

const loader = new GoogleDriveRetriever({
  credentials: getGoogleDriveCredentials()!,
  folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
  scopes: ["https://www.googleapis.com/auth/drive.readonly"],
});

// const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.5 });
const model = new ChatCloudflareWorkersAI({
  model: "@cf/meta/llama-3.1-70b-instruct",
  cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN,
})
const chain = await createStuffDocumentsChain({
  prompt: SYSTEM_PROMPT,
  llm: model,
  outputParser: new StringOutputParser(),
});

const authz = new AuthZService(
  process.env.PANGEA_SERVICE_TOKEN!,
  new PangeaConfig({ domain: process.env.NEXT_PUBLIC_PANGEA_DOMAIN }),
);

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

  const authzResponses: object[] = [];
  const documents = await loader.invoke("");

  // send request to CF request with documents in the body
  let cfResp = await fetch(`http://${process.env.CF_WORKER_URL}/load`, {
    method: "POST",
    body: JSON.stringify({ docs: documents }),
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((err) => {
    console.error(err);
    return new Response("Error ingesting documents", { status: 500 });
  });

  // const vectorStore = await MemoryVectorStore.fromDocuments(
  //   await loader.invoke(""),
  //   new OpenAIEmbeddings(),
  // );
  // const retriever = vectorStore.asRetriever();
  // let docs = await retriever.invoke(body.userPrompt);
  cfResp = await fetch(`http://${process.env.CF_WORKER_URL}/get`, {
    method: "POST",
    body: JSON.stringify({ userPrompt: body.userPrompt }),
    headers: {
      "Content-Type": "application/json",
    },
  }).catch((err) => {
    console.error(err);
    return new Response("Error fetching ingested documents", { status: 500 });
  });

  let docs = await cfResp.json();

  // Filter documents based on user's permissions in AuthZ.
  if (body.authz) {
    docs = await Promise.all(
      docs.map(async (doc: Document) => {
        const response = await authz.check({
          subject: { type: "user", id: username },
          action: "read",
          resource: { type: "file", id: doc.metadata?.id },
          debug: true,
        });
        authzResponses.push({
          request_id: response.request_id,
          request_time: response.request_time,
          response_time: response.response_time,
          result: response.result,
          status: response.status,
          summary: response.summary,
        });
        return response.result.allowed ? doc : null;
      }),
    ).then((results) => results.filter((doc) => doc !== null));
  }

  const llmReply = await chain.invoke({
    firstName: profile.first_name,
    lastName: profile.last_name,
    context: docs,
    input: [new HumanMessage(body.userPrompt)],
  });
  return Response.json({
    reply: llmReply,
    authzResponses,
  });
}
