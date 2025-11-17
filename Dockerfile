# Use Python 3.11 slim image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port (can be overridden by platform)
EXPOSE 5000

# Use environment variable for port
ENV PORT=5000

# Start application using gunicorn with dynamic port
CMD gunicorn app:app --bind 0.0.0.0:$PORT --workers 2
