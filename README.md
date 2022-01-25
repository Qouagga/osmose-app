# OsmoseApp

[![Continuous integration][ci-badge]][ci-link]

[ci-badge]: https://github.com/Project-ODE/osmose-app/actions/workflows/continuous-integration.yml/badge.svg
[ci-link]: https://github.com/Project-ODE/osmose-app/actions/workflows/continuous-integration.yml

## Deployment

For Ifremer infrastructure follow the comments in the .gitlab-ci.yml file, otherwise use the docker-compose.yml file (you should create a .env file with the required variables).

## Development

This project uses poetry (`pip install poetry`) for Python dev and npm for Javascript dev.

### Setup

**Backend:**
```bash
# Initial setup
poetry install
docker run --name devdb -e POSTGRES_PASSWORD=postgres -p 127.0.0.1:5432:5432 -d postgis/postgis
poetry run ./manage.py seed
# Run
docker start devdb
poetry run ./manage.py runserver
```

**Frontend:**
```bash
# Initial setup
cd frontend
npm install
# Run
npm start
```

### Testing

```bash
# Run backend & frontend tests
poetry run ./manage.py test
cd frontend; npm test

# Run backend coverage
coverage run ./manage.py test && coverage report
```
