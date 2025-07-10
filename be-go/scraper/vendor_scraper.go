package scraper

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/zoodro/be-go/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// VendorScraper handles scraping vendor data
type VendorScraper struct {
	jwtToken          string
	vendorsCollection *mongo.Collection
	client            *http.Client
}

// NewVendorScraper creates a new vendor scraper
func NewVendorScraper(jwtToken string, vendorsCollection *mongo.Collection) *VendorScraper {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}
	return &VendorScraper{
		jwtToken:          jwtToken,
		vendorsCollection: vendorsCollection,
		client:            client,
	}
}

// getHeaders returns the HTTP headers for API requests
func (s *VendorScraper) getHeaders() http.Header {
	headers := http.Header{}
	headers.Set("accept", "application/json")
	headers.Set("authorization", fmt.Sprintf("jwt %s", s.jwtToken))
	headers.Set("origin", "https://foodro.snappfood.ir")
	headers.Set("referer", "https://foodro.snappfood.ir/")
	headers.Set("user-agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1")
	return headers
}

// FetchVendorDetails fetches details for a specific vendor
func (s *VendorScraper) FetchVendorDetails(vendorID int) (map[string]interface{}, error) {
	url := fmt.Sprintf("https://foodro-api.snappfood.ir/CustomerVendor/GetVendorDetail?vendorID=%d", vendorID)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	req.Header = s.getHeaders()

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("error fetching vendor details. Status: %d, Response: %s", resp.StatusCode, string(body))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	return result, nil
}

// FetchPage fetches a page of vendors
func (s *VendorScraper) FetchPage(pageNumber, pageSize int) (*models.VendorPageResponse, error) {
	url := fmt.Sprintf("https://foodro-api.snappfood.ir/CustomerVendor/GetHomePageList?pageNumber=%d&pageSize=%d", pageNumber, pageSize)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	req.Header = s.getHeaders()

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("error fetching vendors page. Status: %d, Response: %s", resp.StatusCode, string(body))
	}

	var result models.VendorPageResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	return &result, nil
}

// StoreVendors stores vendors in the database
func (s *VendorScraper) StoreVendors(ctx context.Context, vendors []models.Vendor) error {
	if len(vendors) == 0 {
		return nil
	}

	for _, vendor := range vendors {
		filter := bson.M{"id": vendor.ID}
		update := bson.M{"$set": vendor}
		opts := options.Update().SetUpsert(true)

		_, err := s.vendorsCollection.UpdateOne(ctx, filter, update, opts)
		if err != nil {
			return fmt.Errorf("error storing vendor %d: %w", vendor.ID, err)
		}
	}

	log.Printf("Successfully processed %d vendors in MongoDB", len(vendors))
	return nil
}

// StoreVendorDetails stores vendor details in the database
func (s *VendorScraper) StoreVendorDetails(ctx context.Context, vendorID int, details map[string]interface{}) error {
	filter := bson.M{"id": vendorID}
	update := bson.M{"$set": bson.M{"details": details}}
	opts := options.Update().SetUpsert(true)

	_, err := s.vendorsCollection.UpdateOne(ctx, filter, update, opts)
	if err != nil {
		return fmt.Errorf("error storing vendor details for %d: %w", vendorID, err)
	}

	return nil
}

// ScrapeAllVendors scrapes all vendor data
func (s *VendorScraper) ScrapeAllVendors(ctx context.Context) error {
	log.Println("Fetching all vendors...")

	pageNumber := 1
	pageSize := 20

	for {
		response, err := s.FetchPage(pageNumber, pageSize)
		if err != nil {
			return fmt.Errorf("error scraping page %d: %w", pageNumber, err)
		}

		// Extract vendors from all sections
		var vendors []models.Vendor
		for _, section := range response.Sections {
			vendors = append(vendors, section.Items...)
		}

		// Store vendors
		if err := s.StoreVendors(ctx, vendors); err != nil {
			return fmt.Errorf("error storing vendors from page %d: %w", pageNumber, err)
		}

		log.Printf("Successfully processed page %d", pageNumber)

		// If no more vendors, break
		if len(vendors) == 0 {
			break
		}

		pageNumber++
	}

	log.Println("Fetching all vendors: done")
	return nil
}

// FetchVendorsDetails fetches details for all vendors
func (s *VendorScraper) FetchVendorsDetails(ctx context.Context) error {
	log.Println("Fetching vendor details...")

	// Find vendors without details
	filter := bson.M{"details": bson.M{"$exists": false}}
	projection := bson.M{"id": 1}

	cursor, err := s.vendorsCollection.Find(ctx, filter, options.Find().SetProjection(projection))
	if err != nil {
		return fmt.Errorf("error finding vendors without details: %w", err)
	}
	defer cursor.Close(ctx)

	var vendors []struct {
		ID int `bson:"id"`
	}

	if err := cursor.All(ctx, &vendors); err != nil {
		return fmt.Errorf("error reading vendors: %w", err)
	}

	log.Printf("Total vendors to process: %d", len(vendors))

	// Process vendors in batches using goroutines
	batchSize := 30
	var wg sync.WaitGroup
	sem := make(chan struct{}, batchSize) // Semaphore to limit concurrent goroutines

	for i := 0; i < len(vendors); i += batchSize {
		end := i + batchSize
		if end > len(vendors) {
			end = len(vendors)
		}

		batch := vendors[i:end]
		completedVendors := 0

		for _, vendor := range batch {
			wg.Add(1)
			sem <- struct{}{} // Acquire

			go func(vendorID int) {
				defer wg.Done()
				defer func() { <-sem }() // Release

				details, err := s.FetchVendorDetails(vendorID)
				if err != nil {
					log.Printf("Error fetching vendor details for %d: %v", vendorID, err)
					return
				}

				if err := s.StoreVendorDetails(ctx, vendorID, details); err != nil {
					log.Printf("Error storing vendor details for %d: %v", vendorID, err)
					return
				}

				completedVendors++
			}(vendor.ID)
		}

		wg.Wait()
		log.Printf("Completed batch %d/%d", (i/batchSize)+1, (len(vendors)+batchSize-1)/batchSize)
		time.Sleep(100 * time.Millisecond)
	}

	log.Println("Fetching vendor details: done")
	return nil
}
