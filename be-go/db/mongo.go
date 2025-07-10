package db

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	Client                *mongo.Client
	VendorsCollection     *mongo.Collection
	TempVendorsCollection *mongo.Collection
)

func InitMongoDB() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Error loading .env file, using environment variables")
	}

	mongoURL := os.Getenv("MONGO_DB_URL")
	if mongoURL == "" {
		mongoURL = "mongodb://localhost:27017/zoodro"
		log.Println("Using default MongoDB URL:", mongoURL)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURL))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Ping the database to verify connection
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}

	log.Println("Connected to MongoDB successfully")
	Client = client

	// Initialize collections
	db := client.Database("zoodro")
	VendorsCollection = db.Collection("vendors")
	TempVendorsCollection = db.Collection("temp_vendors")
}

func CloseMongoDB() {
	if Client != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		if err := Client.Disconnect(ctx); err != nil {
			log.Fatalf("Failed to disconnect from MongoDB: %v", err)
		}
		log.Println("MongoDB connection closed")
	}
}
