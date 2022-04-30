include .env.development

alias = shelterApp

dev-up:
	npm run start:dev

ps:
	docker-compose ps

production-build:
	docker build -f Dockerfile -t outreach_app:$$(git rev-parse --short HEAD) .
	docker login -u "$(DOCKER_HUB_USER)" -p "$(DOCKER_HUB_PASSWORD)"
	docker tag  outreach_app:$$(git rev-parse --short HEAD) shelterapp/outreach_app:1.0.0
	docker push shelterapp/outreach_app:1.0.0

production-up:
	docker login -u "$(DOCKER_HUB_USER)" -p "$(DOCKER_HUB_PASSWORD)"
	docker-compose -f docker-compose.yml up -d