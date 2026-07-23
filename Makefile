.PHONY: install dev api test build preview publish docker

install:
	npm install

dev:
	npm run dev

api:
	npm run dev:api

test:
	npm test

build:
	npm run build

preview:
	npm run preview

publish:
	npm run publish:status

docker:
	docker compose up --build

