FROM node:20-slim

WORKDIR /app

RUN npm install -g supergateway@3.4.3 @modelcontextprotocol/server-everything

EXPOSE 8080

CMD ["supergateway", \
     "--port", "8080", \
     "--baseUrl", "http://localhost:8080", \
     "--ssePath", "/sse", \
     "--messagePath", "/message", \
     "--stdio", "npx -y @modelcontextprotocol/server-everything"]
