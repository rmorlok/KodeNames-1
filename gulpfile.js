'use strict';

let gulp = require('gulp'),
    awspublish = require('gulp-awspublish'),
    parallelize = require('concurrent-transform'),
    cloudfront = require('gulp-cloudfront-invalidate');

function get_cloudfront_invalidator() {
    return cloudfront({
        distribution: process.env.KODENAMES_CLOUDFRONT_DISTRIBUTION,
        paths: ['/*'],
    });
}

function get_aws_publisher() {
    return awspublish.create({
        params: {
            Bucket: process.env.KODENAMES_S3_BUCKET,
        },
    });
}

function push() {
    let publisher = get_aws_publisher();
    const S3_HEADERS = {
        'x-amz-acl': 'public-read',
        'Cache-Control': 'max-age=300, no-transform, public',
    };

    return gulp
        .src([
            'scripts/**',
            'data/**',
            'styles/**',
            'index.html'
        ], {base: './'})
        .pipe(awspublish.gzip())
        .pipe(
            parallelize(
                publisher.publish(S3_HEADERS, { createOnly: false, force: true }, 10),
            ),
        )
        .pipe(awspublish.reporter());
}

function invalidate() {
    return gulp
        .src('*')
        .pipe(get_cloudfront_invalidator());
}
gulp.task('invalidate', invalidate);

gulp.task('deploy', gulp.series(push, invalidate));

gulp.task('default', cb => {
    console.error('Please specify an operation: deploy, etc');
    cb();
});
