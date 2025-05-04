package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"sort"

	"github.com/Shogoki/icloud-shared-album-go"
	"github.com/gorilla/mux"
)

type ErrorResponse struct {
	Error string `json:"error"`
}

type ImageResponse struct {
	Caption      string `json:"caption"`
	FullImageUrl string `json:"fullImageUrl"`
	ThumbnailUrl string `json:"thumbnailUrl"`
	AssetType    string `json:"assetType"`
}

func getAlbumHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	token := vars["token"]

	if token == "" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(ErrorResponse{Error: "token is required"})
		return
	}

	client := icloudalbum.NewClient()
	response, err := client.GetImages(token)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(ErrorResponse{Error: err.Error()})
		return
	}

	if len(response.Photos) == 0 {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	// Convert to ImageResponse format and sort by date created
	images := make([]ImageResponse, 0, len(response.Photos))
	for _, photo := range response.Photos {
		log.Printf("Processing photo %s with %d derivatives", photo.PhotoGUID, len(photo.Derivatives))
		
		// Find the largest and smallest derivatives by file size
		var fullImage, thumbnail icloudalbum.Derivative
		maxSize := int64(0)
		minSize := int64(1<<63 - 1)

		for key, deriv := range photo.Derivatives {
			log.Printf("Derivative %s: size=%d, URL=%v", key, deriv.FileSize, deriv.URL)
			
			// Skip derivatives without URLs
			if deriv.URL == nil {
				continue
			}

			if deriv.FileSize > maxSize {
				maxSize = deriv.FileSize
				fullImage = deriv
			}
			if deriv.FileSize < minSize {
				minSize = deriv.FileSize
				thumbnail = deriv
			}
		}

		log.Printf("Selected full image size=%d URL=%v", fullImage.FileSize, fullImage.URL)
		log.Printf("Selected thumbnail size=%d URL=%v", thumbnail.FileSize, thumbnail.URL)

		assetType := "image"
		if photo.MediaAssetType != nil && *photo.MediaAssetType == "video" {
			assetType = "video"
		}

		// If we don't have a valid full image URL, try to find any derivative with a URL
		if fullImage.URL == nil {
			for _, deriv := range photo.Derivatives {
				if deriv.URL != nil {
					fullImage = deriv
					break
				}
			}
		}

		// If we still don't have a thumbnail URL, use the full image URL
		if thumbnail.URL == nil {
			thumbnail = fullImage
		}

		fullImageUrl := ""
		if fullImage.URL != nil {
			fullImageUrl = *fullImage.URL
		}

		thumbnailUrl := ""
		if thumbnail.URL != nil {
			thumbnailUrl = *thumbnail.URL
		}

		images = append(images, ImageResponse{
			Caption:      photo.Caption,
			FullImageUrl: fullImageUrl,
			ThumbnailUrl: thumbnailUrl,
			AssetType:    assetType,
		})
	}

	// Sort by date created
	sort.Slice(images, func(i, j int) bool {
		return response.Photos[i].DateCreated.Before(response.Photos[j].DateCreated)
	})

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(images)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := mux.NewRouter()
	r.HandleFunc("/api/albums/{token}", getAlbumHandler).Methods("GET")

	// Add middleware for CORS
	r.Use(func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			next.ServeHTTP(w, r)
		})
	})

	log.Printf("Server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
