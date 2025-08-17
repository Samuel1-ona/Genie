import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import { aoBridge } from '../../server/aoBridge';

// Mock Express-like request/response for serverless environment
function createMockExpress(req: HandlerEvent): any {
  return {
    body: req.body,
    method: req.httpMethod,
    headers: req.headers,
  };
}

function createMockResponse(): any {
  let statusCode = 200;
  let responseBody: any = null;
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  return {
    status: (code: number) => ({
      json: (data: any) => {
        statusCode = code;
        responseBody = data;
      },
    }),
    json: (data: any) => {
      statusCode = 200;
      responseBody = data;
    },
    getResponse: () => ({
      statusCode,
      body: JSON.stringify(responseBody),
      headers,
    }),
  };
}

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        ok: false,
        error: 'Method not allowed',
      }),
    };
  }

  try {
    const mockReq = createMockExpress(event);
    const mockRes = createMockResponse();

    await aoBridge(mockReq, mockRes);

    const response = mockRes.getResponse();
    return response;
  } catch (error: any) {
    console.error('AO Bridge serverless error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        ok: false,
        error: error?.message ?? 'Internal server error',
      }),
    };
  }
};
