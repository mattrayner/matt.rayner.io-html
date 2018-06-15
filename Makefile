build: build-live build-sitemap build-critical

build-live:
	gulp build:live

build-sitemap:
	gulp build:sitemap

build-critical:
	gulp build:critical

deploy:
	aws s3 sync dist/ s3://matt.rayner.io --delete
	aws s3 mv s3://matt.rayner.io/about.html s3://matt.rayner.io/about
	aws cloudfront create-invalidation --distribution-id E3HOG8IOQC2JWY \
		--paths /assets/images/* /assets/images/social/* /assets/images/favicon/* /js/* /css/* /*.html /*.xml /*.pdf \
		 		/*.jpg /*.png /about