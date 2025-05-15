FROM python:3.9-slim

WORKDIR /app

# Copy requirements file (create it first)
COPY requirements.txt .

# Add this section to install curl
# RUN apt-get update && \
#     apt-get install -y --no-install-recommends curl && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*
RUN apt-get update && apt-get install -y curl


# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]