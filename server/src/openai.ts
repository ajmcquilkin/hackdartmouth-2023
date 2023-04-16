import express, { Request, Response } from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_SEC_KEY = process.env.OPENAI_SEC_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/completions';

export const prompt = async (prompt: string, maxTokens?: number, temperature?: number): Promise<string> => {
    try {
      console.log('\nPROMPT:\n', prompt);
      const response = await axios.post(OPENAI_API_URL, {
        model: 'text-davinci-003',
        prompt,
        max_tokens: maxTokens || 256,
        temperature: temperature || 0.5,
      }, { headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_SEC_KEY}`,
      }});
      const reply = response.data.choices[0].text.replace(/^\n\n/g, '')
      console.log('\nREPLY:\n', reply)
      return reply
    } catch (error) {
        console.error(error.message);
        throw new Error('Error getting completions from OpenAI API');
    }
}