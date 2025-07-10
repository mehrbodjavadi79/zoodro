package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/zoodro/be-go/cmd/refresh"
	"github.com/zoodro/be-go/db"
	"github.com/zoodro/be-go/handlers"
)

var serverPort = os.Getenv("SERVER_PORT")

func main() {
	go runServer()

	for {
		<-time.Tick(6 * time.Hour)
		refresh.RefreshVendors()
	}
}



func runServer() {
	// Initialize MongoDB connection
	db.InitMongoDB()
	defer db.CloseMongoDB()

	// Set up Gin
	router := gin.Default()

	// Configure CORS
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Root endpoint
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Hello World",
		})
	})

	// Vendors endpoint with timer middleware
	router.GET("/vendors", handlers.TimerMiddleware(), handlers.GetVendors)

	// Start server in a goroutine
	go func() {
		if err := router.Run(":" + serverPort); err != nil {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	log.Println("Server started on :" + serverPort)

	// Wait for interrupt signal to gracefully shut down the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")
}
