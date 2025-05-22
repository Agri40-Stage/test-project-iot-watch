# this is python image that will be used 
FROM python:3.12-slim


# Set environment variables for the image
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set working directory inside the container to /app
WORKDIR /app

# Copy everything from the current folder (backend/) into the image
COPY . /app

# Create a virtual environment
RUN python -m venv venv


# Activate virtual env and install dependencies
RUN . venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt

# Make sure the virtual environment is used by default
ENV PATH="/app/venv/bin:$PATH"

# Expose default Flask port 
EXPOSE 5000

# Start the app once the conainer is running 
CMD ["venv/bin/python", "app.py"]