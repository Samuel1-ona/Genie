import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// Custom plugin for AO API middleware
function aoApiPlugin() {
  return {
    name: 'ao-api-plugin',
    configureServer(server) {
      // Add CORS headers to all responses
      server.middlewares.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS'
        );
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization'
        );

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          res.end();
          return;
        }

        next();
      });

      // AO Bridge endpoint
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

      // Admin command endpoint
      server.middlewares.use('/api/admin/command', async (req, res, next) => {
        if (req.method === 'POST') {
          console.log('Admin command triggered');
          try {
            // Parse request body
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                const requestBody = JSON.parse(body);
                console.log('Admin command request:', requestBody);

                // Import and call admin command handler
                const { adminCommand } = await import(
                  './server/adminCommand.ts'
                );

                // Create mock Express-like request/response objects
                const mockReq = {
                  body: requestBody,
                  method: req.method,
                  headers: req.headers,
                  protocol: 'http',
                  get: (name: string) => req.headers[name.toLowerCase()],
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

                await adminCommand(mockReq, mockRes);
              } catch (error) {
                console.error('Error in Admin Command:', error);
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
            console.error('Error in Admin Command middleware:', error);
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
  server: {
    port: 5173,
    host: true,
    proxy: {
      // Proxy AO testnet requests to avoid CORS issues
      '/ao-testnet': {
        target: 'https://cu.ao-testnet.xyz',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ao-testnet/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(
              'Received Response from the Target:',
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
      // Proxy for the redirected URLs (cu16.ao-testnet.xyz)
      '/cu16.ao-testnet.xyz': {
        target: 'https://cu16.ao-testnet.xyz',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/cu16\.ao-testnet\.xyz/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to cu16:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log(
              'Received Response from cu16:',
              proxyRes.statusCode,
              req.url
            );
          });
        },
      },
      // CORS proxy for AO requests
      '/ao-proxy': {
        target: 'https://cu.ao-testnet.xyz',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ao-proxy/, ''),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('AO proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('AO proxy request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('AO proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
  define: {
    // Add global variables for development
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
  },
});
