# Use lightweight Node.js image
FROM node:24-alpine3.20

# Set working directory inside the container
WORKDIR /app

# Copy project files into the container
COPY . .

# Install dependencies
RUN npm install


# Start the dev server
CMD ["npm", "run", "dev"]