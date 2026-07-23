.PHONY: install dev test build preview publish docker

install:
	npm install

dev:
	npm run dev

test:
	npm test

build:
	npm run build

preview:
	npm run preview

publish:
	npm run publish:status

docker:
	docker build -t dioptra:local .
