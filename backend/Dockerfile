FROM python:3.12-alpine

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN addgroup -g ${GROUP_ID} -S appgroup && \
    adduser -u ${USER_ID} -D -S -G appgroup appuser

USER appuser

WORKDIR /code

COPY . /code/

RUN pip install -r requirements.txt

CMD ["python", "manage.py", "runserver", "0.0.0.0:8080"]
