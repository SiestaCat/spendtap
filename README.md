# SpendTap

A modern expense tracking application built with Vite, TailwindCSS, and vanilla JavaScript.

## Features

- 💸 Track expenses and income
- 📊 Monthly and yearly breakdowns
- 🏷️ Category-based filtering
- 🌐 Multi-language support (Spanish/English)
- 💱 Multi-currency support (EUR/USD/GBP)
- 🌙 Dark/Light theme
- 📱 Responsive design
- 📈 Balance tracking over time

## Development

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Local Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` file with your API configuration:
   ```
   VITE_APP_LANG=es
   VITE_API_BASE_URL=http://localhost:8000
   VITE_API_TOKEN=your-secure-api-token-here
   ```

5. Start development server:
   ```bash
   pnpm dev
   ```

The app will be available at `http://localhost:3000`

### Build

To build for production:

```bash
pnpm build
```

## Docker

### Build Docker Image

Build the Docker image:

```bash
docker build -t spendtap .
```

### Run with Docker

Run the container with default settings:

```bash
docker run -p 80:80 spendtap
```

The app will be available at `http://localhost`

### Run with Custom Environment Variables

To run with custom API configuration, you can build the image with build args:

```bash
# Build with custom environment
docker build -t spendtap \
  --build-arg VITE_API_BASE_URL=https://your-api.com \
  --build-arg VITE_API_TOKEN=your-token \
  --build-arg VITE_APP_LANG=en \
  .

# Run the container
docker run -p 8080:80 spendtap
```

### Docker Compose (Optional)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  spendtap:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:8000
      - VITE_API_TOKEN=your-secure-api-token-here
      - VITE_APP_LANG=es
```

Run with:

```bash
docker-compose up -d
```

## API Configuration

The application requires a backend API. Configure the following environment variables:

- `VITE_API_BASE_URL`: Your API base URL (default: `http://localhost:8000`)
- `VITE_API_TOKEN`: Authentication token for API requests
- `VITE_APP_LANG`: Default language (`es` or `en`, default: `es`)

## Project Structure

```
spendtap/
├── assets/
│   ├── components/        # JavaScript components
│   ├── lang/             # Translation files
│   └── ...
├── pages/                # HTML page templates
├── components/           # Reusable HTML components
├── dist/                 # Build output
└── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

ISC License