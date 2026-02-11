# this is python image that will be used 
FROM python:3.12-slim


# Set environment variables for the image
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory inside the container to /app
WORKDIR /app

# Copy everything from the current folder (backend/) into the image
COPY . /app

# Install dependencies directly (no venv needed in Docker)
RUN pip install --upgrade pip && pip install -r requirements.txt

# Expose default Flask port 
EXPOSE 5000

# Start the app once the conainer is running 
CMD ["python", "app.py"]