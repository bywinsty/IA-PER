import { request } from 'node:http';
import { expect, test } from '@playwright/test';

function requestStatus(baseURL, rawPath) {
  const origin = new URL(baseURL);

  return new Promise((resolve, reject) => {
    const clientRequest = request({
      hostname: origin.hostname,
      port: origin.port,
      path: rawPath,
      method: 'GET'
    }, response => {
      response.resume();
      response.once('end', () => resolve(response.statusCode));
    });

    clientRequest.once('error', reject);
    clientRequest.end();
  });
}

test('static server rejects malformed URLs without exiting', async ({ baseURL }) => {
  await expect(requestStatus(baseURL, '/%E0%A4%A')).resolves.toBe(400);
  await expect(requestStatus(baseURL, '/index.html')).resolves.toBe(200);
});
