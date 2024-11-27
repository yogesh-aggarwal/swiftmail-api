PRODUCTION_BRANCH := production

dev:
	@bun dev

server:
	@bun start

setup:
	@bun install

clean:
	@rm -rf node_modules

deploy:
	@git push origin main
	@git update-ref -d refs/heads/$(PRODUCTION_BRANCH)
	@git checkout -b $(PRODUCTION_BRANCH)
	@git push origin $(PRODUCTION_BRANCH) -f
	@git checkout main
