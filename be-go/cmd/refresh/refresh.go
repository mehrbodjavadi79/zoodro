package refresh

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/zoodro/be-go/db"
	"github.com/zoodro/be-go/models"
	"github.com/zoodro/be-go/scraper"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// RefreshVendors refreshes the vendor data by scraping and updating the database
func RefreshVendors() error {
	log.Println("Refreshing vendors...")

	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using environment variables")
	}

	// Get JWT token
	jwtToken := os.Getenv("MY_JWT")
	if jwtToken == "" {
		return fmt.Errorf("MY_JWT environment variable is not set")
	}

	// Initialize MongoDB
	db.InitMongoDB()
	defer db.CloseMongoDB()

	// Create a background context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Minute)
	defer cancel()

	// Clear temp vendors collection
	_, err = db.TempVendorsCollection.DeleteMany(ctx, bson.M{})
	if err != nil {
		return fmt.Errorf("failed to clear temp vendors collection: %w", err)
	}

	// Create scraper for temp collection
	tempScraper := scraper.NewVendorScraper(jwtToken, db.TempVendorsCollection)

	// Scrape all vendors to temp collection
	if err := tempScraper.ScrapeAllVendors(ctx); err != nil {
		return fmt.Errorf("failed to scrape vendors: %w", err)
	}

	// Fetch vendor details
	retryCount := 0
	maxRetries := 15
	for retryCount < maxRetries {
		if err := tempScraper.FetchVendorsDetails(ctx); err != nil {
			log.Printf("Error fetching vendor details (attempt %d/%d): %v", retryCount+1, maxRetries, err)
		}

		// Check if there are any vendors without details
		count, err := db.TempVendorsCollection.CountDocuments(ctx, bson.M{"details": bson.M{"$exists": false}})
		if err != nil {
			return fmt.Errorf("failed to count vendors without details: %w", err)
		}

		if count == 0 {
			// All vendors have details, break the loop
			break
		}

		retryCount++
		time.Sleep(1 * time.Second)
	}

	// Mark all existing vendors as outdated
	_, err = db.VendorsCollection.UpdateMany(ctx, bson.M{}, bson.M{"$set": bson.M{"outdated": true}})
	if err != nil {
		return fmt.Errorf("failed to mark existing vendors as outdated: %w", err)
	}

	// Process vendors in chunks
	chunkSize := 200

	// Find all vendor IDs from temp collection
	tempCursor, err := db.TempVendorsCollection.Find(
		ctx,
		bson.M{"details": bson.M{"$exists": true}},
		options.Find().SetProjection(bson.M{"id": 1}),
	)
	if err != nil {
		return fmt.Errorf("failed to fetch vendor IDs: %w", err)
	}
	defer tempCursor.Close(ctx)

	var vendorIDs []int
	var vendorIDDocs []struct {
		ID int `bson:"id"`
	}
	if err := tempCursor.All(ctx, &vendorIDDocs); err != nil {
		return fmt.Errorf("failed to process vendor IDs: %w", err)
	}
	for _, doc := range vendorIDDocs {
		vendorIDs = append(vendorIDs, doc.ID)
	}

	totalCount := len(vendorIDs)
	processed := 0
	log.Printf("Total vendors to process: %d", totalCount)

	// Process vendors in chunks
	for i := 0; i < len(vendorIDs); i += chunkSize {
		end := i + chunkSize
		if end > len(vendorIDs) {
			end = len(vendorIDs)
		}

		chunkIDs := vendorIDs[i:end]
		chunkDocs, err := fetchVendorsByIDs(ctx, chunkIDs)
		if err != nil {
			return fmt.Errorf("failed to fetch chunk vendors: %w", err)
		}

		for _, doc := range chunkDocs {
			// Add the document and remove the outdated flag
			doc.Outdated = false

			// Upsert the document to the main vendors collection
			filter := bson.M{"id": doc.ID}
			_, err := db.VendorsCollection.ReplaceOne(ctx, filter, doc, options.Replace().SetUpsert(true))
			if err != nil {
				log.Printf("Error upserting vendor %d: %v", doc.ID, err)
				continue
			}
		}

		processed += len(chunkDocs)
		log.Printf("Processed %d/%d vendors", processed, totalCount)
	}

	// Remove all vendors that still have the outdated flag
	result, err := db.VendorsCollection.DeleteMany(ctx, bson.M{"outdated": true})
	if err != nil {
		return fmt.Errorf("failed to remove outdated vendors: %w", err)
	}
	log.Printf("Removed %d outdated vendors", result.DeletedCount)

	log.Println("Refreshing vendors: done")
	return nil
}

// fetchVendorsByIDs fetches vendors by their IDs from the temp collection
func fetchVendorsByIDs(ctx context.Context, ids []int) ([]models.Vendor, error) {
	filter := bson.M{"id": bson.M{"$in": ids}}
	cursor, err := db.TempVendorsCollection.Find(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch vendors by IDs: %w", err)
	}
	defer cursor.Close(ctx)

	var vendors []models.Vendor
	if err := cursor.All(ctx, &vendors); err != nil {
		return nil, fmt.Errorf("failed to decode vendors: %w", err)
	}

	return vendors, nil
}

