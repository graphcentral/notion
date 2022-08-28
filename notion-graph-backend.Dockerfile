# pull official base image
FROM node:16.15.1-alpine

# set working directory
WORKDIR /docker/packages/notion-graph-frontend

# add `/app/node_modules/.bin` to $PATH
ENV PATH /docker/packages/notion-graph-frontend/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

# add app
COPY . ./

# start app
CMD ["npm", "start"]