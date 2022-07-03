# Getting Started

By default the Auth-Manager starts with the following setup:

```bash
ENV PORT=3000
ENV START_SWAGGER='false'

ENV AUTH_MANAGER_USERNAME='superadmin'
ENV AUTH_MANAGER_PASSWORD='superadmin'
ENV AUTH_MANAGER_EMAIL='super@admin.com'
ENV AUTH_MANAGER_ACCESS_TOKEN_TTL=900
ENV AUTH_MANAGER_REFRESH_TOKEN_TTL=604800
ENV AUTH_MANAGER_TOKEN_SECRET='d742181c71078eb527e4fce1d47a21785bac97cb86518bf43a73acd65dbd9eb0'

ENV REDIS_PASS='myRedisPass'
ENV REDIS_HOST='redis'
ENV REDIS_PORT=6379
ENV REDIS_TTL=600
ENV REDIS_MAX_RESPONSES=100
ENV REDIS_DB_INDEX=0

ENV MONGO_USER='mongo'
ENV MONGO_PASS='mongo'
ENV MONGO_DB_NAME='configs'
ENV MONGO_URL='mongodb://localhost:27017'
```

While this is pretty neat to kickoff some quick development aka with docker compose, you definitely want to update those envs for production! Your docker-compose.yml might look something like this:

```yml
version: '3.9'
services:
  auth-manager:
    container_name: auth-manager
    build:
      context: .
      dockerfile: dockerfile
      target: local
    volumes:
      - ./:/app
    depends_on:
      - mongo
      - redis
    environment:
      - PORT=3001
      - START_SWAGGER=true
      - PRINT_ENV=true
      - AUTH_MANAGER_USERNAME=superadmin
      - AUTH_MANAGER_PASSWORD=superadmin
      - AUTH_MANAGER_EMAIL=super@admin.com
      - AUTH_MANAGER_ACCESS_TOKEN_TTL=900
      - AUTH_MANAGER_REFRESH_TOKEN_TTL=604800
      - AUTH_MANAGER_TOKEN_SECRET=d742181c71078eb527e4fce1d47a21785bac97cb86518bf43a73acd6
      - MONGO_USER=mongo
      - MONGO_PASS=mongo
      - MONGO_DB_NAME=auth-manager
      - MONGO_URI=mongodb://mongo:27017
      - REDIS_PASS=myRedisPass
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_TTL=600
      - REDIS_MAX_RESPONSES=100
      - REDIS_DB_INDEX=0
    ports:
      - 3000:3001

  mongo:
    command: mongod --wiredTigerCacheSizeGB 1.5 --logpath /dev/null
    image: mongo
    container_name: mongo
    environment:
      - MONGO_INITDB_ROOT_USERNAME=mongo
      - MONGO_INITDB_ROOT_PASSWORD=mongo
      - MONGO_INITDB_DATABASE=configs
    volumes:
      - mongo_data:/data/db
    ports:
      - 27017:27017

  redis:
    image: redis
    container_name: redis
    ports:
      - 6379:6379
    command: redis-server --requirepass myRedisPass --loglevel warning

volumes:
  mongo_data:

networks:
  default:
    name: AUTH_MANAGER_NETWORK
```

Running `docker compose up` should log:

```bash
auth-manager  | [Nest] 37  - 07/01/2022, 3:45:42 PM     LOG [AppConfiguration] {
auth-manager  |     "APP_CONFIG": {
auth-manager  |         "port": "3000",
auth-manager  |         "startSwagger": true
auth-manager  |     },
auth-manager  |     "AUTH_MANAGER_CONFIG": {
auth-manager  |         "username": "superadmin",
auth-manager  |         "password": "superadmin",
auth-manager  |         "email": "super@admin.com",
auth-manager  |         "accessTokenTTL": 900,
auth-manager  |         "refreshTokenTTL": 604800,
auth-manager  |         "tokenSecret": "d742181c71078eb527e4fce1d47a21785bac97cb86518bf43a73acd6",
auth-manager  |         "rejectUnauthorized": false
auth-manager  |     },
auth-manager  |     "MONGO_CONFIG": {
auth-manager  |         "uri": "mongodb://mongo:27017",
auth-manager  |         "ssl": false,
auth-manager  |         "sslValidate": false,
auth-manager  |         "dbName": "auth-manager",
auth-manager  |         "user": "mongo",
auth-manager  |         "pass": "mongo"
auth-manager  |     },
auth-manager  |     "REDIS_CONFIG": {
auth-manager  |         "host": "redis",
auth-manager  |         "port": 6379,
auth-manager  |         "ttl": 600,
auth-manager  |         "max": 100,
auth-manager  |         "db": 0,
auth-manager  |         "password": "myRedisPass"
auth-manager  |     }
auth-manager  | }
auth-manager  | [Nest] 37  - 07/01/2022, 3:45:42 PM     LOG https://localhost:3000/api-docs-json
auth-manager  | [Nest] 37  - 07/01/2022, 3:45:42 PM     LOG https://localhost:3000/api-doauth
```

## App Settings

No magic involved, keeping it simple :)

- PORT=3000 `sets the port`
- START_SWAGGER=true `enables the open-api`
- PRINT_ENV=true `logs the envs`

On startup, if not exists, the user **superadmin** is created. To change the default credentials you might want to set these envs:

- `AUTH_MANAGER_USERNAME`
- `AUTH_MANAGER_PASSWORD`
- `AUTH_MANAGER_EMAIL`

Otherwise you will need to signin and change those credentials at a later time by using the REST API.

There are four roles with different permissions:

- superadmin `the auth-manager god`
- moderator `read/write - cannot elevate users (demigod)`
- consumer `readonly - cannot signin, signout, refresh`
- member `signin, signout, refresh`

> On singup the user gets the **member** role

By default a session expires after 15 minutes: `AUTH_MANAGER_ACCESS_TOKEN_TTL=900` (seconds).
A session can be refreshed for 7 days before expiring: `AUTH_MANAGER_REFRESH_TOKEN_TTL=604800` (seconds).
Once a session expires it cannot be refreshed and the user is forced to re-signin. To refresh a session the refresh token is used,
which generates a new access/refresh token pair. Thus in our example an active user can stay signed in infinitely or is forced to re-signin if the session is not refreshed within 7 days. The auth-manager verifies the tokens by signing them with the `AUTH_MANAGER_TOKEN_SECRET`. A common misunderstanding is that a JWT is encrypted. It's not!

A consumer token is used by services, which don't need to authenticate but rather rely on authorization. For example our auth-manager is consumed by other microservices. Thus a microservice is not a **user** but a **consumer**! All it's interested in is fetch some configuration data and thus has no need for authentication.

## HTTPS (tls/ssl)

The auth-manager comes with a self-signed tls/ssl setup, which does not have an expiration date.
It might be enough for you though for security reasons you might want to provide your own tls/ssl.
Do to so replace the `127.0.0.1.crt` and `127.0.0.1.key` in the `ssl` folder. In docker you can map your tls/ssl setup with `-v $(pwd)/ssl:/usr/src/app/ssl`. If you use signed certificates you might also want to set `AUTH_MANAGER_REJECT_UNAUTHORIZED=true`.

## Databases

The auth-manager requires a mongo and redis database to operate. It's a straight forward approach. Simply provide the credentials via the envs as show above in the [Getting Started](#getting-started) example.
