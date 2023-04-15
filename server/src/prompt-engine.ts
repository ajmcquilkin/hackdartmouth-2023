import { prompt } from "./openai";

export type Document = {
    timestamp: number,
    metadata: string,
    blob: string
}

const dissectQuestion = async (question: string): Promise<{
    refersThis: boolean,
    refersHistorical: boolean
}> => {
    const refersThis = 'Y' // await prompt(`The user asks: "${question}"\n Is the user referring to something specific? Y for yes, N for no.`, 1);
    const refersHistorical = await prompt(`The user asks: "${question}"\n Is the user referring to things they have read before? Y for yes, N for no.`, 1);
    return { refersThis: refersThis == 'Y', refersHistorical: refersHistorical == 'Y' }
}

export const handleQuestion = async (question: string) => {
    const { refersThis, refersHistorical } = await dissectQuestion(question);
    let overallContext = ''
    if (refersThis) {
        // fetch local context from IPC
        const localContext = ''
        // append to prompt
        overallContext = `The user is currently reading: "${localContext}"\n}`
    }
    if (refersHistorical) {
        // fetch metadata from db
        // prompt GPT to choose docs by evaluating user question against metadata
        // fetch full text of chosen docs
        // append to prompt
        const historicalDocs: Document[] = []
        overallContext += `From the past, the user has read these things: "${historicalDocs.map((doc, idx) => `Document #${idx}, read on ${new Date(doc.timestamp)}:\n "${doc.blob}"\n`)}"\n`
    }
    const response = await prompt(`${overallContext}\n Now the user asks: ${question}.\n What is the answer?`, 256);
}