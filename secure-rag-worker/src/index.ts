/**
* This cloudflare worker embeds documents using Cloudflare Workers AI Embeddings and stores them in a Cloudflare Vectorize Store.
*/

import type {
	VectorizeIndex,
	Fetcher,
	Request,
	ExecutionContext
} from "@cloudflare/workers-types";

import {
	CloudflareVectorizeStore,
	CloudflareWorkersAIEmbeddings,
} from "@langchain/cloudflare";
import { Document } from "@langchain/core/documents";

export default {
	async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
		const { pathname } = new URL(request.url);

		const embeddings = new CloudflareWorkersAIEmbeddings({
			binding: env.AI,
			model: "@cf/baai/bge-base-en-v1.5",

		});

		const store = new CloudflareVectorizeStore(embeddings, {
			index: env.VECTORIZE,
		});

		if(pathname == "/load") {

			let body: any = await request.json();

			// Cloudflare doesn't support a way to retrieve document ID when doing similaritySearch, so instead we store the document ID in the metadata of the document
			// Update the metadata, don't overwrite it
			(body.docs as Document[]).forEach(doc => doc.metadata.id = doc.id);

			const docStoreResp = await store.addDocuments(
				body.docs, { ids: (body.docs as Document[]).map(doc => doc.id) as string[] }
			)
		
			return Response.json({ success: true });
		} else {
			const body: any = await request.json();

			const results = await store.similaritySearch(body.userPrompt, 1);
			return Response.json(results);
		}
	},
};