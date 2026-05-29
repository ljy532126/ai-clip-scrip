const http = require('http');
const { Readable } = require('stream');

const DEEPSEEK_BASE = 'https://api.deepseek.com';
const PORT = 15722;

function fixMessages(data) {
    if (!data.messages && !Array.isArray(data.messages)) return;
    for (const msg of data.messages) {
        if (msg.role !== 'assistant') continue;
        if (Array.isArray(msg.content)) {
            const hasThinking = msg.content.some(b => b.type === 'thinking');
            if (!hasThinking) {
                msg.content.unshift({ type: 'thinking', thinking: '' });
            }
        } else {
            msg.reasoning_content = msg.reasoning_content || '';
        }
    }
}

const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ id: 'root', object: 'list' }));
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(404);
        res.end('Not Found');
        return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
        try {
            const data = JSON.parse(body);
            fixMessages(data);

            const target = DEEPSEEK_BASE + req.url;
            console.log('->', target);

            const apiRes = await fetch(target, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': req.headers.authorization,
                    'anthropic-version': req.headers['anthropic-version'] || ''
                },
                body: JSON.stringify(data)
            });

            console.log('<-', apiRes.status);
            const headers = {};
            apiRes.headers.forEach((v, k) => { headers[k] = v; });
            res.writeHead(apiRes.status, headers);

            if (apiRes.body) {
                Readable.fromWeb(apiRes.body).pipe(res);
            } else {
                res.end();
            }
        } catch (err) {
            console.error('Proxy error:', err.message);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Proxy Error: ' + err.message }));
        }
    });
});

server.listen(PORT, () => {
    console.log('DS4 Proxy on http://127.0.0.1:' + PORT);
});
