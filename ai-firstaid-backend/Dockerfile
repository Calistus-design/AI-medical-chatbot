# File: Dockerfile

# 1. Start from an official NVIDIA CUDA base image. This is crucial for GPU support.
#    We choose a version that comes with Python 3.10, PyTorch, and the necessary CUDA drivers.
FROM pytorch/pytorch:2.1.2-cuda12.1-cudnn8-runtime

# 2. Set up the working directory inside the container.
WORKDIR /app

# 3. Copy the requirements file into the container first.
#    This is a caching optimization. Docker will only re-run the pip install
#    if this specific file changes.
COPY requirements.txt .

# 4. Install all the Python dependencies listed in requirements.txt.
#    The --no-cache-dir flag helps keep the image size smaller.
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy the rest of your application code (app.py) and data (the 'data' folder)
#    into the container's working directory.
COPY . .

# 6. Expose the port that our FastAPI server will run on.
EXPOSE 8000

# 7. Define the command to run when the container starts.
#    This command starts the Uvicorn server, telling it to run the 'app' object
#    from the 'app.py' file.
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]