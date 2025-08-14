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
          console.log('AO middleware triggered');
          try {
            // Parse request body
            let body = '';
            req.on('data', chunk => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                const { action, data, tags } = JSON.parse(body);
                console.log('Parsed request:', { action, data, tags });

                // Import and call mock handler
                const { mockAo } = await import('./src/server/mockAo.ts');
                const result = await mockAo(action, data, tags);

                // Set response headers
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

                // Send response
                res.statusCode = 200;
                res.end(JSON.stringify({ ok: true, data: result }));
              } catch (error) {
                console.error('Error processing AO request:', error);
                res.statusCode = 500;
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
            console.error('Error in AO middleware:', error);
            res.statusCode = 500;
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
