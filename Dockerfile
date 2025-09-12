# Step 1: Base image
FROM node:20-alpine

# Step 2: App directory
WORKDIR /usr/src/app

# Step 3: Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Step 4: Copy source code
COPY . .

# Step 5: Build TypeScript
RUN npm run build

# Step 6: Expose port
EXPOSE 5000

# Step 7: Start app
CMD ["npm", "start"]
