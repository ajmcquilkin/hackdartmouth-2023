import { db } from "./db";
import { fromSQLiteDateTime, naturalDateFormat } from "./lib";
import { embed, prompt } from "./openai";
import * as pinecone from "./pinecone";

export type Document = {
    id: string,
    timestamp: string,
    metadata: string,
    blob: string
}

const MAX_PROMPT_TOKENS = 2048 * 7;

const confirmYesNo = async (input: string): Promise<boolean> => {
    const confirmation = await prompt(`You responded: ${input}\nIn the above response, did you answer yes? Return Y for yes, N for no.`, 10);
    return confirmation == 'Y';
}

const dissectQuestion = async (question: string): Promise<{
    refersThis: boolean,
    refersHistorical: boolean
}> => {
    const refersThis = await confirmYesNo(await prompt(`When I ask you "${question}", am I likely asking about something I'm reading and am confused about (to some extent) right now?`));
    const refersHistorical = await confirmYesNo(await prompt(`When I ask you: "${question}", am I likely referring to other stuff I have read before?`));
    return { refersThis, refersHistorical }
}

const buildLocalContext = async (question: string, hardcodedContext?: string): Promise<string> => {
        // TODO fetch local context from IPC
        const localContext = hardcodedContext;
        if (!localContext) {
            return '';
        }
        return `Below is what I am currently referring to. I am reading this and pointing at it: "${localContext}"\n`
}

const buildHistoricalContext = async (question: string) => {
        // const metadataRows = db.prepare('SELECT id, metadata FROM documents').all() as Pick<Document, 'id' | 'metadata'>[];
        const questionTopics = await prompt(`"${question}?"\nI am asking you this question. List out the topics this question likely touches upon.`);
        const questionEmbedding = await embed(`${question}\n${questionTopics}`);
        const similarDocs = await pinecone.query(questionEmbedding, 3, 0.72);
        if (similarDocs.length == 0) {
            return 'Simply respond to the user with "I don\'t think you\'ve read anything about that. Can you provide more details?" DISREGARD ALL TEXT BELOW THIS POINT.'
        }
        const fullBlobRows = db.prepare('SELECT id, timestamp, blob FROM documents WHERE id IN (' + similarDocs.map(() => '?').join(',') + ')').all(similarDocs.map(({ id }) => id)) as Pick<Document, 'id' | 'timestamp' | 'blob'>[];

        // cap the length of this historical context
        const MAX_DOC_BLOB_LENGTH = MAX_PROMPT_TOKENS / fullBlobRows.length;
        fullBlobRows.forEach(doc => {
            doc.blob = doc.blob.substring(0, MAX_DOC_BLOB_LENGTH);
        })

        return `Below are documents separated by [START] and [END] flags.\n${fullBlobRows.map((doc) => `[START] Document ID: ${doc.id}, read on ${naturalDateFormat(fromSQLiteDateTime(doc.timestamp))}. ${doc.blob} [END]`).join('\n')}"\nThe above information contains texts I have read a long time ago.`

        // prompt GPT to choose docs by evaluating user question against metadata
        // const chosenDocIds = (await prompt(`${metadataRows.map((row) => `[START] Document ID: ${row.id}. ${row.metadata} [END]`).join('\n')}"\n The above are all the documents I have read in the past. Each document has an integer ID and the content is surrounded by [START] and [END] flags.\nReturn a list of comma-separated IDs for the documents that are directly relevant to this question: ${question}`)).split(',');
        // console.log('CHOSEN:', chosenDocIds)

        // const fullBlobRows = db.prepare('SELECT id, timestamp, metadata FROM documents WHERE id IN (' + chosenDocIds.map(() => '?').join(',') + ')').all(chosenDocIds) as Pick<Document, 'id' | 'timestamp' | 'metadata'>[];
        
        // cap the length of this historical context
        // const MAX_DOC_BLOB_LENGTH = MAX_PROMPT_TOKENS / fullBlobRows.length;
        // fullBlobRows.forEach(doc => {
        //     doc.metadata = doc.metadata.substring(0, MAX_DOC_BLOB_LENGTH);
        // })
        // return `Below are documents separated by [START] and [END] flags.\n${fullBlobRows.map((doc) => `[START] Document ID: ${doc.id}, read on ${naturalDateFormat(fromSQLiteDateTime(doc.timestamp))}. ${doc.metadata} [END]`).join('\n')}"\nThe above information contains texts I have read a long time ago.`
}

export const handleQuestion = async (question: string, hardcodedContext?: string) => {
    const { refersThis, refersHistorical } = await dissectQuestion(question);
    let overallContext = ''
    if (refersHistorical) {
        overallContext += await buildHistoricalContext(question);
    }
    if (refersThis) {
        overallContext += await buildLocalContext(question, hardcodedContext);
    }
    // Very briefly mention the document metadata such as when I read it, title, author, etc, and then provide the essence of the document so I recall what it was about.
    const response = await prompt(`${overallContext}\nNow answer this question and elaborate: "${question}?" Address me as "you".`, 512);
    return response;
}

export const generateMetadata = async (blob: string, timestamp: string) => {
    return await prompt(`"${blob}"\nI read this article on ${timestamp}. First, list out any available metadata (like title, author, publisher, date read, etc) of the article. Then, tell me the essence of this article to convey the core meaning to someone who has not read it.`, 256, 0.2)
    // I read this article on ${timestamp}. First, list out any available metadata (like title, author, publisher, date read, etc) of the article. Second, list out the separate topic discussed in this article. Third, list any very distinctive keywords. Lastly, 
}