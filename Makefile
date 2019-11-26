build-release:
	BASE_URL=https://matt.rayner.io/ ./node_modules/gulp-cli/bin/gulp.js release

build:
	./node_modules/gulp-cli/bin/gulp.js

deploy: build-release
	aws s3 --profile personal sync dist/ s3://matt.rayner.io --delete
	aws s3 --profile personal mv s3://matt.rayner.io/about.html s3://matt.rayner.io/about
ifdef TRAVIS_TAG
	aws cloudfront --profile personal create-invalidation --distribution-id E3HOG8IOQC2JWY \
			--paths /assets/images/* /assets/images/social/* /assets/images/favicon/* /js/* /css/* /*.html /*.xml /*.pdf \
					/*.jpg /*.png /about
endif

deploy-ci: build-release
	aws s3 sync dist/ s3://matt.rayner.io --delete
	aws s3 mv s3://matt.rayner.io/about.html s3://matt.rayner.io/about
ifdef TRAVIS_TAG
	aws cloudfront create-invalidation --distribution-id E3HOG8IOQC2JWY \
			--paths /assets/images/* /assets/images/social/* /assets/images/favicon/* /js/* /css/* /*.html /*.xml /*.pdf \
					/*.jpg /*.png /about
endif
