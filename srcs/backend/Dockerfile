# Étape de build
FROM golang:1.24.0-alpine AS builder

WORKDIR /app

# Copier les fichiers Go
COPY go.mod ./
RUN go mod download

COPY . .

# Build du binaire
RUN go build -o server .

# Étape finale, image légère
FROM alpine:3.20

WORKDIR /app

COPY --from=builder /app/server .

EXPOSE 8080

CMD ["./server"]

