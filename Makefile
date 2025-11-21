.PHONY: test lint package deploy clean install

# Install dependencies
install:
	npm install
	cd catalyst && npm install

# Run all tests
test:
	npm test

# Run unit tests only
test-unit:
	npm run test:unit

# Run integration tests
test-integration:
	npm run test:integration

# Run E2E tests
test-e2e:
	npm run test:e2e

# Lint code
lint:
	npm run lint || echo "Linter not configured"

# Package Catalyst functions
package:
	mkdir -p deploy
	cd catalyst && zip -r ../deploy/artifact.zip . -x "*.git*" -x "node_modules/*" -x "*.test.js" -x "*.spec.js"

# Deploy to Catalyst (Development)
deploy: package
	@if command -v zcli >/dev/null 2>&1; then \
		cd catalyst && zcli catalyst:deploy --env development; \
	else \
		echo "Catalyst CLI not found. Please install: npm install -g zcli"; \
		echo "Or manually upload deploy/artifact.zip via Catalyst Console (Development)"; \
	fi

# Deploy to Production
deploy-prod: package
	@if command -v zcli >/dev/null 2>&1; then \
		cd catalyst && zcli catalyst:deploy --env production; \
	else \
		echo "Catalyst CLI not found. Please install: npm install -g zcli"; \
		echo "Or manually upload deploy/artifact.zip via Catalyst Console (Production)"; \
	fi

# Clean build artifacts
clean:
	rm -rf deploy/
	rm -rf node_modules/
	rm -rf catalyst/node_modules/

# Run all checks (lint + test)
check: lint test

# CI pipeline simulation
ci: install lint test package

