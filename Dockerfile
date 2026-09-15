FROM node:16-alpine AS build

ENV NODE_OPTIONS="--max_old_space_size=4096"

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/maestria-computacion-front /usr/share/nginx/html
COPY src/assets/env.template.js /etc/nginx/templates/env.js.template

ENV NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html/assets

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --output-document=- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
