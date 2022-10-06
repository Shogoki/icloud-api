FROM denoland/deno:distroless-1.26.0

WORKDIR /app

# Prefer not to run as root.
#USER deno
ADD . /app
RUN deno cache index.ts

EXPOSE 80

CMD ["run", "--allow-all", "index.ts"] # TODO: NOT RUN with allo-all