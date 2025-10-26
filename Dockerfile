# Use Node.js 18 LTS as base image
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm and dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm i
RUN pnpm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx config
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    # API endpoint for runtime config
    location /api/config {
        add_header Content-Type application/json;
        return 200 '{
            "VITE_APP_LANG": "\$VITE_APP_LANG",
            "VITE_API_BASE_URL": "\$VITE_API_BASE_URL", 
            "VITE_API_TOKEN": "\$VITE_API_TOKEN"
        }';
    }
    
    # Serve static assets directly
    location ~* ^/assets/.+\.(js|css|json|html)$ {
        try_files \$uri =404;
        expires 1h;
    }
    
    # Serve language files directly and allow directory listing for /assets/lang/
    location = /assets/lang/ {
        autoindex on;
        autoindex_format json;
        add_header Content-Type application/json;
    }
    
    # Serve individual language files
    location ~* ^/(assets/)?lang/.+\.json$ {
        try_files \$uri =404;
        add_header Content-Type application/json;
    }
    
    # Handle SPA routing for everything else
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
}
EOF

# Copy built application from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Install envsubst for variable substitution
RUN apk add --no-cache gettext

# Create entrypoint script
COPY <<EOF /docker-entrypoint.sh
#!/bin/sh
set -e

# Set defaults if not provided
export VITE_APP_LANG=\${VITE_APP_LANG:-es}
export VITE_API_BASE_URL=\${VITE_API_BASE_URL:-http://localhost:8000}
export VITE_API_TOKEN=\${VITE_API_TOKEN:-your-secure-api-token-here}

# Substitute variables in nginx config
envsubst '\$VITE_APP_LANG \$VITE_API_BASE_URL \$VITE_API_TOKEN' < /etc/nginx/conf.d/default.conf > /tmp/nginx.conf
mv /tmp/nginx.conf /etc/nginx/conf.d/default.conf

# Start nginx
exec "\$@"
EOF

RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Use custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]