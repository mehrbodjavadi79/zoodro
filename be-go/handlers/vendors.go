package handlers

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/zoodro/be-go/db"
	"github.com/zoodro/be-go/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// TimerMiddleware logs the execution time of handlers
func TimerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		duration := time.Since(start)
		log.Printf("API %s executed in %.4f seconds", c.Request.URL.Path, duration.Seconds())
	}
}

// GetVendors retrieves vendors within the specified geographic bounds
func GetVendors(c *gin.Context) {
	var req models.GetVendorsRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request parameters"})
		return
	}

	// Create MongoDB filter
	filter := bson.M{
		"$and": []bson.M{
			{"longitude": bson.M{"$gte": req.TopLeftLng}},
			{"longitude": bson.M{"$lte": req.BottomRightLng}},
			{"latitude": bson.M{"$lte": req.TopLeftLat}},
			{"latitude": bson.M{"$gte": req.BottomRightLat}},
		},
	}

	// Define projection to retrieve only necessary fields
	projection := bson.M{
		"latitude":                 1,
		"longitude":                1,
		"title":                    1,
		"maxOfferPercent":          1,
		"details.offer.upperLimit": 1,
		"details.offer.lowerLimit": 1,
	}

	// Define sort options to sort by maxOfferPercent in descending order
	sortOptions := options.Find().SetProjection(projection).SetSort(bson.M{"maxOfferPercent": -1})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := db.VendorsCollection.Find(ctx, filter, sortOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query vendors"})
		log.Printf("Database error: %v", err)
		return
	}
	defer cursor.Close(ctx)

	var vendors []models.Vendor
	if err := cursor.All(ctx, &vendors); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process vendors"})
		log.Printf("Cursor error: %v", err)
		return
	}

	// Transform vendors to DTOs
	var vendorsDTO []models.VendorDTO
	for _, vendor := range vendors {
		offerPercent := int(vendor.MaxOfferPercent)
		if offerPercent == 0 {
			continue
		}

		var maxVal, minVal *int
		if vendor.Details != nil {
			if details, ok := (*vendor.Details)["offer"].(map[string]interface{}); ok {
				if upperLimit, exists := details["upperLimit"]; exists {
					if val, ok := toInt(upperLimit); ok {
						maxVal = &val
					}
				}
				if lowerLimit, exists := details["lowerLimit"]; exists {
					if val, ok := toInt(lowerLimit); ok {
						minVal = &val
					}
				}
			}
		}

		vendorsDTO = append(vendorsDTO, models.VendorDTO{
			Lat:  vendor.Latitude,
			Lng:  vendor.Longitude,
			Name: vendor.Title,
			Off:  offerPercent,
			Max:  maxVal,
			Min:  minVal,
		})
	}

	c.JSON(http.StatusOK, models.VendorsResponse{Vendors: vendorsDTO})
}

// Helper function to convert interface{} to int
func toInt(value interface{}) (int, bool) {
	switch v := value.(type) {
	case int:
		return v, true
	case int32:
		return int(v), true
	case int64:
		return int(v), true
	case float32:
		return int(v), true
	case float64:
		return int(v), true
	default:
		return 0, false
	}
}
