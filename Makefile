.PHONY: dev build preview deploy clean install

install:
	bun install

dev:
	bun run dev

build:
	bun run build

preview: build
	bun run preview

deploy: build
	bun run deploy

clean:
	rm -rf dist
