# NLW Copa server application

#### Libraries used:
- fastify: To work with routes.
- @fastify/cors: Handle CORS to allow communication with local frontend.
- @fastify/jwt: To work with JWT in fastify.
- tsx: To compile ts code automatically in runtime.
- prisma: ORM to work with database.
- prisma-erd-generator: To generate prisma ERD diagrams.
- @mermaid-js: Needed to generate the ERD diagrams.
- short-unique-id: To generate unique ID's. It's like UUID but smaller.
- zod: To work with schema validation.

#### Commands used:
- `npx prisma migrated dev`: To create migrations from prisma schema.
- `npx prisma studio`: To open Prisma database visualization tool.
- `npx prisma generate`: To run Prisma generators. In this project it was used primarily to generate the ERD diagram.