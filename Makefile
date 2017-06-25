run:
	npm start

deploy:
	npm run build
	cp -r build/* docs/
