FROM denoland/deno:distroless-1.26.0

WORKDIR /app

# Prefer not to run as root.
#USER deno
COPY deps/index.ts deps/index.ts
RUN deno cache deps/index.ts
ADD . /app
RUN deno cache app.ts

EXPOSE 80

CMD ["run", "--allow-all", "app.ts"] # TODO: NOT RUN with allo-all