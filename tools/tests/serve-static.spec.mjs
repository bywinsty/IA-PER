import { request } from 'node:http';
import { expect, test } from '@playwright/test';

function requestResponse(baseURL, rawPath, method = 'GET') {
  const origin = new URL(baseURL);

  return new Promise((resolve, reject) => {
    const clientRequest = request({
      hostname: origin.hostname,
      port: origin.port,
      path: rawPath,
      method
    }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.once('end', () => resolve({
        status: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(chunks)
      }));
    });

    clientRequest.once('error', reject);
    clientRequest.end();
  });
}

function requestStatus(baseURL, rawPath) {
  return requestResponse(baseURL, rawPath).then(response => response.status);
}

test('static server rejects malformed URLs without exiting', async ({ baseURL }) => {
  await expect(requestStatus(baseURL, '/%E0%A4%A')).resolves.toBe(400);
  await expect(requestStatus(baseURL, '/index.html')).resolves.toBe(200);
});

test('static server enforces method, not-found, traversal, and MIME contracts', async ({ baseURL }) => {
  const headResponse = await requestResponse(baseURL, '/index.html', 'HEAD');
  expect(headResponse.status).toBe(200);
  expect(headResponse.body).toHaveLength(0);

  const methodResponse = await requestResponse(baseURL, '/index.html', 'POST');
  expect(methodResponse.status).toBe(405);
  expect(methodResponse.headers.allow).toBe('GET, HEAD');

  const missingResponse = await requestResponse(baseURL, '/missing-test-page.html');
  expect(missingResponse.status).toBe(404);

  const traversalResponse = await requestResponse(baseURL, '/..%2fpackage.json');
  expect(traversalResponse.status).toBe(403);

  const cssResponse = await requestResponse(baseURL, '/assets/css/header.css');
  expect(cssResponse.status).toBe(200);
  expect(cssResponse.headers['content-type']).toMatch(/^text\/css/);
});
