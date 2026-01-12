FROM node:20-bookworm-slim

WORKDIR /app

# Create database directory
RUN mkdir -p /db
# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./

# Install dependencies (including devDependencies for build)
# Note: Python and build-essential are often needed for native modules like better-sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && \
    npm ci && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY . .

ENV DATABASE_PATH="/db/campus.db"

# Build the Next.js app
# This will output to .next/
RUN npm run build -- --webpack

# Expose the listening port
EXPOSE 3000

# Start the application
# We use 'npm start' which runs 'next start'
CMD ["npm", "start"]
