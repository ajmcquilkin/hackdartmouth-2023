import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_API_URL = 'https://main-dc46c62.svc.us-west4-gcp.pinecone.io';

export const upsert = async (id: number, vector: number[]) => {
  try {
    const response = await axios.post(PINECONE_API_URL + '/vectors/upsert', {
      vectors: [
        {
          id,
          metadata: {
          },
          values: vector
          
        }
      ],
    }, { headers: {
      'Content-Type': 'application/json',
      'Api-Key': PINECONE_API_KEY,
    }});
    return response.data;
  } catch (e) {
    console.error(e.message);
    throw new Error('Error upserting vector to Pinecone')
  }
}

export const query = async (vector: number[], topK: number, minScore: number) => {
  try {
    const response = await axios.post(PINECONE_API_URL + '/query', {
      vector,
      topK,
      includeMetadata: true,
      includeValues: true
    }, { headers: {
      'Content-Type': 'application/json',
      'Api-Key': PINECONE_API_KEY,
    }});
    response.data.matches.forEach(match => {
      console.log(match.id, match.score)
    })
    return response.data.matches.filter((match: any) => match.score > minScore);
  } catch (e) {
    console.error(e.message);
    throw new Error('Error querying Pinecone')
  }
}