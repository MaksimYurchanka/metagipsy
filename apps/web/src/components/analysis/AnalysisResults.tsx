==> Cloning from https://github.com/MaksimYurchanka/metagipsy-backend
==> Checking out commit 52faf26b55c6a55b14663501bec1dd394a84f2f5 in branch main
==> Downloading cache...
==> Transferred 217MB in 7s. Extraction took 5s.
==> Requesting Node.js version >=18.0.0
==> Using Node.js version 24.3.0 via ./apps/api/package.json
==> Docs on specifying a Node.js version: https://render.com/docs/node-version
==> Using Bun version 1.1.0 (default)
==> Docs on specifying a Bun version: https://render.com/docs/bun-version
==> Running build command 'cd apps/api && npm install && npm run build'...
> @metagipsy/api@1.0.0 postinstall
> npx prisma generate
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 138ms
Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
Help us improve the Prisma ORM for everyone. Share your feedback in a short 2-min survey: https://pris.ly/orm/survey/release-5-22
added 213 packages, and audited 214 packages in 34s
24 packages are looking for funding
 run npm fund for details
found 0 vulnerabilities
> @metagipsy/api@1.0.0 build
> rm -rf dist && npx prisma generate && tsc
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
✔ Generated Prisma Client (v5.22.0) to ./node_modules/@prisma/client in 203ms
Start by importing your Prisma Client (See: https://pris.ly/d/importing-client)
Tip: Need your database queries to be 1000x faster? Accelerate offers you that and more: https://pris.ly/tip-2-accelerate
==> Uploading build...
==> Uploaded in 4.7s. Compression took 2.7s
==> Build successful 🎉
==> Deploying...
==> Running 'cd apps/api && npm start'
> @metagipsy/api@1.0.0 start
> node dist/index.js
2025-07-08 16:58:09:589 info: MetaGipsy API server running on port 3001
==> Your service is live 🎉
==>
==> ///////////////////////////////////////////////////////////
==>
==> Available at your primary URL https://metagipsy-backend.onrender.com
==>
==> ///////////////////////////////////////////////////////////
2025-07-08 16:59:25:5925 info: Redis connected
2025-07-08 16:59:25:5925 info: Redis ready
2025-07-08 16:59:37:5937 error: Claude API error, falling back to local scoring: 500 {"type":"error","error":{"type":"api_error","message":"Internal server error"}}
==> Detected service running on port 3001
==> Docs on specifying a port: https://render.com/docs/web-services#port-binding

Look at this and this: