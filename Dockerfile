# Use an official Node runtime based on Alpine
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Bind the app to port 5008
EXPOSE 5008

# Define the command to run the app
CMD [ "npm", "run", "dev" ]
