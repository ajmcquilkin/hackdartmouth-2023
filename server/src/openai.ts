import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/engines/davinci-codex/completions';

const axiosInstance = axios.create({
  baseURL: OPENAI_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
  },
});

export const prompt = async (prompt: string, maxTokens: number): Promise<string> => {
    try {
        const response = await axiosInstance.post('/', {
        prompt,
        max_tokens: maxTokens,
        });
        return response.data.choices[0].text;
    } catch (error) {
        console.error(error);
        throw new Error('Error getting completions from OpenAI API');
    }
}