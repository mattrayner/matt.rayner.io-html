build: build-live build-sitemap build-critical

build-live:
	./node_modules/gulp-cli/bin/gulp.js build:live

build-sitemap:
	./node_modules/gulp-cli/bin/gulp.js build:sitemap

build-critical:
	./node_modules/gulp-cli/bin/gulp.js build:critical

deploy:
	aws s3 sync dist/ s3://matt.rayner.io --delete
	aws s3 mv s3://matt.rayner.io/about.html s3://matt.rayner.io/about
ifdef TRAVIS_TAG
	aws cloudfront create-invalidation --distribution-id E3HOG8IOQC2JWY \
			--paths /assets/images/* /assets/images/social/* /assets/images/favicon/* /js/* /css/* /*.html /*.xml /*.pdf \
					/*.jpg /*.png /about
endif
