import { prompt } from "./openai";

export type Document = {
    id: string,
    timestamp: number,
    metadata: string,
    blob: string
}

const MAX_PROMPT_TOKENS = 2048;

const dissectQuestion = async (question: string): Promise<{
    refersThis: boolean,
    refersHistorical: boolean
}> => {
    const refersThis = 'Y' // await prompt(`The user asks: "${question}"\n Is the user referring to something specific? Y for yes, N for no.`, 1);
    const refersHistorical = await prompt(`The user asks: "${question}"\n Is the user referring to things they have read before? Y for yes, N for no.`, 1);
    return { refersThis: refersThis == 'Y', refersHistorical: refersHistorical == 'Y' }
}

const buildLocalContext = async (question: string): Promise<string> => {
        // TODO fetch local context from IPC
        const localContext = 'SAMPLE LOCAL CONTEXT'
        return `This is what the user is currently referring to. They are reading this and pointing at it: "${localContext}"\n}`
}

const buildHistoricalContext = async (question: string): Promise<string> => {
        // TODO fetch metadata column from db
        const metadataRows: {
            id: number,
            metadata: string
        }[] = []

        // prompt GPT to choose docs by evaluating user question against metadata
        const chosenDocIds: string[] = (await prompt(`The user asks: "${question}"\n The user has read these things before: "${metadataRows.map((row, idx) => `Document #${idx}, metadata: "${row.metadata}"\n`)}"\n Which of these documents is the user referring to?`, 256)).split(',');
        // TODO fetch full text of chosen docs using chosenDocIds
        const fullBlobRows: Document[] = []
        // cap the length of this historical context
        const MAX_DOC_BLOB_LENGTH = MAX_PROMPT_TOKENS / fullBlobRows.length;
        fullBlobRows.forEach(doc => {
            doc.blob = doc.blob.substring(0, MAX_DOC_BLOB_LENGTH);
        })
        return `From the past, the user has read these things: "${fullBlobRows.map((doc, idx) => `Document #${idx}, read on ${new Date(doc.timestamp)}:\n "${doc.blob}"\n`)}"\n`
}

export const handleQuestion = async (question: string) => {
    const { refersThis, refersHistorical } = await dissectQuestion(question);
    let overallContext = ''
    if (refersThis) {
        overallContext += await buildLocalContext(question);
    }
    if (refersHistorical) {
        overallContext += await buildHistoricalContext(question);
    }
    const response = await prompt(`${overallContext}\n Now the user asks: ${question}.\n What is the answer?`, 256);
    return response;
}