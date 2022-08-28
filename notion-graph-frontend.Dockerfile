# pull official base image
FROM node:16.15.1-alpine

# set working directory
WORKDIR /docker/packages/notion-graph-frontend

# add `/app/node_modules/.bin` to $PATH
ENV PATH /docker/packages/notion-graph-frontend/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY ../../package.json /docker/

# add app
COPY . /docker/packages/notion-graph-frontend

WORKDIR /docker/packages/notion-graph-frontend

# If unfortunately the host computer has a different architecture, esbuild aint gonna work.
# Some sort of monkeypatch to make it just work
# RUN npm i --target_arch=x64 --target_platform=linux --legacy-peer-deps esbuild-loader@^2.19.0

# start app
CMD ["npm", "run", "dev"]