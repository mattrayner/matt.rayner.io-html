build:
	build-local
	make build-sitemap
	make build-critical

build-live:
	gulp build:live
	make build-sitemap
	make build-critical

build-local:
	gulp build:local

build-sitemap:
	gulp build:sitemap

build-critical:
	gulp build:critical