# iCloud Shared Album API

A lightweight Go API that provides access to iCloud shared album photos and their URLs.

## Features

- Fetch photos from iCloud shared albums using album tokens
- Retrieve both full-resolution images and thumbnails
- CORS-enabled for web client usage
- Efficient URL caching and matching using photo checksums

## API Endpoints

### Get Album Photos

```
GET /api/albums/{token}
```

Returns a list of photos from the shared album, including their URLs and metadata.

#### Response Format

```json
[
  {
    "guid": "string",
    "filename": "string",
    "derivatives": {
      "full": {
        "url": "string",
        "checksum": "string"
      },
      "thumbnail": {
        "url": "string",
        "checksum": "string"
      }
    }
  }
]
```

## Running Locally

```bash
go run main.go
```

The server will start on port 8080 by default. You can override this using the `PORT` environment variable.

## Docker

Build and run the API using Docker:

```bash
# Build the image
docker build -t icloud-album-api .

# Run the container
docker run -p 8080:8080 icloud-album-api
```

## Environment Variables

- `PORT`: Server port (default: 8080)
