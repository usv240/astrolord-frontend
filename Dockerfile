
# Stage 1: Build the React application
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and bun.lockb (or package-lock.json)
COPY package.json ./
# If you use bun, you might want to install bun or just use npm/yarn. 
# Since package-lock.json exists in the file list, we can use npm.
COPY package-lock.json ./ 

RUN npm install

COPY . .

# Build the app
RUN npm run build

# Stage 2: Serve the React application with Nginx
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
