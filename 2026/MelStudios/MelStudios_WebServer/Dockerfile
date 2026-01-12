FROM python

RUN mkdir /app
WORKDIR /app

COPY requirements.txt .
RUN pip3 install -r requirements.txt

COPY app.py .
COPY signing.py .
COPY request_models.py .

ENTRYPOINT ["gunicorn", "-b", "0.0.0.0:8000", "--workers", "5", "--preload", "--worker-class=uvicorn.workers.UvicornWorker", "app:app"]