import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Custom plugin for AO API middleware
function aoApiPlugin() {
  return {
    name: 'ao-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/ao', async (req, res, next) => {
        if (req.method === 'POST') {
          console.log('AO Bridge triggered');
          try {
            // Parse request body
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                const requestBody = JSON.parse(body);
                console.log('AO Bridge request:', requestBody);

                // Import and call real AO bridge
                const { aoBridge } = await import('./server/aoBridge.ts');

                // Create mock Express-like request/response objects
                const mockReq = {
                  body: requestBody,
                  method: req.method,
                  headers: req.headers,
                } as any;

                const mockRes = {
                  status: (code: number) => ({
                    json: (data: any) => {
                      res.statusCode = code;
                      res.setHeader('Content-Type', 'application/json');
                      res.setHeader('Access-Control-Allow-Origin', '*');
                      res.setHeader(
                        'Access-Control-Allow-Methods',
                        'POST, OPTIONS'
                      );
                      res.setHeader(
                        'Access-Control-Allow-Headers',
                        'Content-Type'
                      );
                      res.end(JSON.stringify(data));
                    },
                  }),
                  json: (data: any) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    res.setHeader(
                      'Access-Control-Allow-Methods',
                      'POST, OPTIONS'
                    );
                    res.setHeader(
                      'Access-Control-Allow-Headers',
                      'Content-Type'
                    );
                    res.end(JSON.stringify(data));
                  },
                } as any;

                await aoBridge(mockReq, mockRes);
              } catch (error) {
                console.error('Error in AO Bridge:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.end(
                  JSON.stringify({
                    ok: false,
                    error:
                      error instanceof Error
                        ? error.message
                        : 'Internal server error',
                  })
                );
              }
            });
          } catch (error) {
            console.error('Error in AO Bridge middleware:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(
              JSON.stringify({
                ok: false,
                error: 'Internal server error',
              })
            );
          }
        } else if (req.method === 'OPTIONS') {
          // Handle CORS preflight
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.statusCode = 200;
          res.end();
        } else {
          next();
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), aoApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
