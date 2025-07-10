# Zoodro Backend Server (Go Implementation)

This is a Go implementation of the Zoodro backend server. It provides the same API endpoints as the Python version but is implemented in Go with the Gin framework.

## Requirements

- Go 1.21 or later
- MongoDB

## Configuration

Copy the `.env.example` file to `.env` and update it with your MongoDB connection string, JWT token, and server port:

```
MONGO_DB_URL=mongodb://localhost:27017/zoodro
MY_JWT=your_jwt_token_here
SERVER_PORT=3030
```

## Running the Server

### Using Go

```bash
# Install dependencies
go mod download

# Run the server (default mode)
go run main.go
```


## Refreshing Vendors Data

The application includes a application level cronjob to refresh the vendors data from the external API:


This command will:
1. Clear the temporary vendors collection
2. Fetch all vendors from the API
3. Fetch details for each vendor
4. Update the main vendors collection
5. Remove outdated vendors

## API Endpoints

### Root endpoint

```
GET /
```

Returns a simple "Hello World" message.

### Vendors endpoint

```
GET /vendors?top_left_lat={value}&top_left_lng={value}&bottom_right_lat={value}&bottom_right_lng={value}
```

Returns vendors within the specified geographic bounds.

#### Query Parameters

- `top_left_lat`: Latitude of the top-left corner
- `top_left_lng`: Longitude of the top-left corner
- `bottom_right_lat`: Latitude of the bottom-right corner
- `bottom_right_lng`: Longitude of the bottom-right corner 