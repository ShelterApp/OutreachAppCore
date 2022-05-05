include .env

alias = shelterApp

dev-up:
	npm run start:dev

ps:
	docker-compose ps

production-build:
	docker build -f Dockerfile -t outreach_app:$$(git rev-parse --short HEAD) .
	docker login -u "$(DOCKER_HUB_USER)" -p "$(DOCKER_HUB_PASSWORD)"
	docker tag  outreach_app:$$(git rev-parse --short HEAD) shelterapp/outreach_app:v$$(git rev-parse --short HEAD)
	docker push shelterapp/outreach_app:v$$(git rev-parse --short HEAD)

production-up:
	git pull
	docker login -u "$(DOCKER_HUB_USER)" -p "$(DOCKER_HUB_PASSWORD)"
	VERSION=v$$(git rev-parse --short HEAD) docker-compose -f docker-compose.yml up -d