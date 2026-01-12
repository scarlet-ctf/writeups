FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV JWT_SECRET=g0ld3n_fr3ddy_w1ll_a1ways_b3_w@tch1ng_y0u
EXPOSE 8000

ENTRYPOINT ["gunicorn", "-b", "0.0.0.0:8000", "--workers", "3", "app:app"]
