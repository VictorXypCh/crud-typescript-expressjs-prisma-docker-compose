# Use the official Node.js 14 base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./
COPY tsconfig.json ./
COPY .env ./.env
COPY prisma ./prisma/


# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

RUN npx prisma generate
# Build the TypeScript code
RUN npm run build

# Expose the port that the application will run on
EXPOSE 3000

# Set the entry point command to run the application
CMD ["npm", "start"]

