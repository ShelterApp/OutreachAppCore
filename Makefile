alias = shelterApp

dev-up:
	npm run start:dev

ps:
	docker-compose ps

testing-up:
	docker-compose -f docker-compose-testing.yml up -d --build app
	
production-up:
	docker-compose -f docker-compose-production.yml up -d --build app

deploy-staging:
	docker build -f devops/build/Dockerfile -t harmonia/backend:$$(git rev-parse --short HEAD) --force-rm .
	docker image prune -f --filter label=stage=builder
	sed "s/{{commit}}/$$(git rev-parse --short HEAD)/g" devops/environment/staging/app-template.yml > docker-compose.yml
	docker-compose -f docker-compose.yml up -d