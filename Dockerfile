FROM denoland/deno:distroless-1.26.0
WORKDIR /app
COPY . .
CMD --unstable run --allow-env --allow-read --allow-net index.ts