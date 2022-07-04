# Getting Started

By default the Auth-Manager starts with the following setup:

```bash
ENV PORT=3000
ENV START_SWAGGER='false'
ENV PRINT_ENV='false'

ENV AUTH_MANAGER_USERNAME='superadmin'
ENV AUTH_MANAGER_PASSWORD='superadmin'
ENV AUTH_MANAGER_EMAIL='super@admin.com'
ENV AUTH_MANAGER_ACCESS_TOKEN_TTL=900
ENV AUTH_MANAGER_REFRESH_TOKEN_TTL=604800
ENV AUTH_MANAGER_TOKEN_SECRET='super-secret'

ENV REDIS_PASS=''
ENV REDIS_HOST='redis'
ENV REDIS_PORT=6379
ENV REDIS_TTL=600
ENV REDIS_MAX_RESPONSES=100
ENV REDIS_DB_INDEX=0

ENV MONGO_USER='mongo'
ENV MONGO_PASS='mongo'
ENV MONGO_DB_NAME='auths'
ENV MONGO_URI='mongodb://localhost:27017'
```

While this is pretty neat to kickoff some quick development aka with docker compose, you definitely want to update those envs for production! Your docker-compose.yml might look something like this:

```yml
version: '3.9'
services:
  auth-manager:
    container_name: auth-manager
    image: cultify/auth-manager
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
      - AUTH_MANAGER_TOKEN_SECRET=super-secret
      - MONGO_USER=mongo
      - MONGO_PASS=mongo
      - MONGO_DB_NAME=auths
      - MONGO_URI=mongodb://mongo:27017
      - REDIS_PASS=""
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
      - MONGO_INITDB_DATABASE=auths
    volumes:
      - mongo_data:/data/db
    ports:
      - 27017:27017

  redis:
    image: redis
    container_name: redis
    ports:
      - 6379:6379
    command: redis-server --loglevel warning

volumes:
  mongo_data:

networks:
  default:
    name: AUTH_MANAGER_NETWORK
```

## App Settings

- PORT `sets the port`
- START_SWAGGER `toggles the open-api`
- PRINT_ENV `logs the envs`

- AUTH_MANAGER_USERNAME `the superadmin username`
- AUTH_MANAGER_PASSWORD `the superadmin password`
- AUTH_MANAGER_EMAIL `the superadmin email`
- AUTH_MANAGER_ACCESS_TOKEN_TTL `the access token ttl; default 15 minutes`
- AUTH_MANAGER_REFRESH_TOKEN_TTL `the refresh token ttl; default 7 days`
- AUTH_MANAGER_TOKEN_SECRET `the access/refresh token secret`

- REDIS_PASS `the redis password`
- REDIS_HOST `the redis host aka localhost`
- REDIS_PORT `the redis port`
- REDIS_TTL `the time how long redis keeps a response in cache; default 5 seconds`
- REDIS_MAX_RESPONSES `maximum number of responses to store in the cache; default 100`
- REDIS_DB_INDEX `the redis database index; range 1-12`

- MONGO_USER `the mondo user`
- MONGO_PASS `the mongo password`
- MONGO_DB_NAME `the mongo database name`
- MONGO_URI `the mongo uri`

## Auth-Manager Insights

On the first application start the superadmin is created.
You can update the email and password later on but the username can't be changed.

There are four roles with different permissions:

- superadmin `the auth-manager god`
- moderator `read/write - cannot elevate users (demigod)`
- consumer `readonly - cannot signin, signout, refresh`
- member `signin, signout, refresh`

By default a session expires after 15 minutes. A session can be refreshed for 7 days before expiring.
Once a session expires it cannot be refreshed and the user is forced to re-signin.
To refresh a session the refresh token is used, which generates a new access/refresh token pair.
Thus an active user can stay signed in infinitely or is forced to re-signin.
A common misunderstanding is that JWTs are encrypted. THEY ARE NOT!

> NEVER misuse a JWT to share credentials or spicy data

A consumer token is used by services, which don't need to authenticate but rather rely on authorization.
For example our auth-manager is consumed by other microservices.
Thus a microservice is not a **user** but a **consumer**!
All it's interested in is fetch some configuration data and thus has no need for authentication.

## HTTPS (tls/ssl)

The auth-manager comes with a self-signed tls/ssl setup, which does not have an expiration date.
It might be enough for you though for security reasons you might want to provide your own tls/ssl.
Do to so replace the `127.0.0.1.crt` and `127.0.0.1.key` in the `ssl` folder.
In docker you can map your tls/ssl setup with `-v $(pwd)/ssl:/usr/src/app/ssl`.
