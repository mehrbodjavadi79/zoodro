package models

type Vendor struct {
	Distance            float64                  `bson:"distance,omitempty" json:"distance,omitempty"`
	IsLiked             bool                     `bson:"isLiked,omitempty" json:"isLiked,omitempty"`
	ID                  int                      `bson:"id" json:"id"`
	SuperType           string                   `bson:"superType,omitempty" json:"superType,omitempty"`
	VendorTag           []map[string]interface{} `bson:"vendorTag,omitempty" json:"vendorTag,omitempty"`
	VendorBanner        []map[string]interface{} `bson:"vendorBanner,omitempty" json:"vendorBanner,omitempty"`
	PriceRange          int                      `bson:"priceRange,omitempty" json:"priceRange,omitempty"`
	Title               string                   `bson:"title" json:"title"`
	ProfilePictureURL   string                   `bson:"profilePictureURL,omitempty" json:"profilePictureURL,omitempty"`
	UserName            string                   `bson:"userName,omitempty" json:"userName,omitempty"`
	Latitude            float64                  `bson:"latitude" json:"latitude"`
	Longitude           float64                  `bson:"longitude" json:"longitude"`
	MaxOfferPercent     float64                  `bson:"maxOfferPercent" json:"maxOfferPercent"`
	Area                map[string]interface{}   `bson:"area,omitempty" json:"area,omitempty"`
	TotalReviews        int                      `bson:"totalReviews,omitempty" json:"totalReviews,omitempty"`
	Rating              float64                  `bson:"rating,omitempty" json:"rating,omitempty"`
	HasNewTag           bool                     `bson:"hasNewTag,omitempty" json:"hasNewTag,omitempty"`
	NavigationJSON      string                   `bson:"navigationJson,omitempty" json:"navigationJson,omitempty"`
	VendorRamadanStatus int                      `bson:"vendorRamadanStatus,omitempty" json:"vendorRamadanStatus,omitempty"`
	Details             *map[string]interface{}  `bson:"details,omitempty" json:"details,omitempty"`
	Outdated            bool                     `bson:"outdated,omitempty" json:"outdated,omitempty"`
}

type VendorDTO struct {
	Lat  float64 `json:"lat"`
	Lng  float64 `json:"lng"`
	Name string  `json:"name"`
	Off  int     `json:"off"`
	Max  *int    `json:"max,omitempty"`
	Min  *int    `json:"min,omitempty"`
}

type VendorsResponse struct {
	Vendors []VendorDTO `json:"vendors"`
}

type GetVendorsRequest struct {
	TopLeftLat     float64 `form:"top_left_lat" binding:"required"`
	TopLeftLng     float64 `form:"top_left_lng" binding:"required"`
	BottomRightLat float64 `form:"bottom_right_lat" binding:"required"`
	BottomRightLng float64 `form:"bottom_right_lng" binding:"required"`
}

// VendorPageResponse represents the API response format from the vendor API
type VendorPageResponse struct {
	Sections []struct {
		Items []Vendor `json:"items"`
	} `json:"sections"`
}
