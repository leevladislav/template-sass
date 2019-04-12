var gulp            = require('gulp'),
    sass            = require('gulp-sass'),
    browserSync     = require('browser-sync'),
    concat          = require('gulp-concat'), 
    uglify          = require('gulp-uglifyjs'), 
    cssnano         = require('gulp-cssnano'), 
    rename          = require('gulp-rename'), 
    del             = require('del'),
    image           = require('gulp-image'), 
    cache           = require('gulp-cache'), 
    autoprefixer    = require('gulp-autoprefixer'),
    notify          = require("gulp-notify"),
    plumber         = require('gulp-plumber'),
    sourcemaps      = require('gulp-sourcemaps'),
    rigger          = require('gulp-rigger'),
    fileinclude     = require('gulp-file-include');

var PATH = {
    dev: 'app/',
    prod: 'dist/',

    /*  another vendors
        for ex: slick: 'node_modules/slick-carousel/slick/'  */
};

// transformation scss to css on dev
gulp.task('sass', function() { 
    return gulp.src(PATH.dev + 'styles/index.scss') 
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass({outputStyle: 'expand'}).on("error", notify.onError())) 
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(sourcemaps.write())
        .pipe(plumber.stop())
        .pipe(gulp.dest(PATH.dev + 'styles'))
        .pipe(browserSync.reload({stream: true}))
});

// live reload on dev
gulp.task('browser-sync', function() { 
    browserSync({ 
        server: { 
            baseDir: PATH.dev 
        },
        notify: false 
    });
});

// watch every file.js and switching them to prod
gulp.task('scripts', function() {
    return gulp.src([ 
        //PATH.dev + 'libs/jquery/jquery.min.js', // another vendors
        PATH.dev + 'js/**/*.js'
        ])
        .pipe(browserSync.reload({stream: true}))
});

// minify css and switching css to prod
gulp.task('css-minify', function() {
    return gulp.src(PATH.dev + 'styles/index.css') 
        .pipe(cssnano()) 
        .pipe(rename({suffix: '.min'})) 
        .pipe(gulp.dest(PATH.prod + 'styles'));
});

// uglify every file.js and switching them to prod
gulp.task('scripts-uglify', function() {
    return gulp.src([ 
        //PATH.dev + 'js/libs/jquery/jquery.min.js', // another vendors
        //PATH.dev + 'js/libs/sticky-kit/script.min.js', // another vendors
        PATH.dev + 'js/*.js'
        ])
        .pipe(concat('scripts.min.js')) 
        .pipe(uglify())
        .pipe(gulp.dest(PATH.prod + 'js')); 
});

gulp.task('html', function () {
    return gulp.src(PATH.dev + '**/*.html')
        .pipe(plumber())
        .pipe(rigger())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(plumber.stop())
        .pipe(browserSync.reload({stream: true}))
});

gulp.task('rsync', function () {
    return gulp.src('app/**')
        .pipe(rsync({
            root: 'app/',
            hostname: 'username@yoursite.com',
            destination: 'yousite/public_html/',
            // include: ['*.htaccess'], // Includes files to deploy
            exclude: ['**/Thumbs.db', '**/*.DS_Store'], // Excludes files from deploy
            recursive: true,
            archive: true,
            silent: false,
            compress: true
        }))
});

// clean min.files and fonts on prod
gulp.task('clean', function() {
    return del([
        PATH.prod + 'styles/styles.min.css', //your path to min.file
        PATH.prod + 'fonts/**/*',
        PATH.prod + 'js/scripts.min.js',//your path to min.file
    ]);
});

// minify and switching images into prod
gulp.task('image', function () {
    gulp.src(PATH.dev + 'img/**/*')
      .pipe(image())
      .pipe(gulp.dest(PATH.prod + 'img'));
});

// prebuilding project 
gulp.task('fonts', function() {
    return gulp.src(PATH.dev + 'fonts/**/*') 
    .pipe(gulp.dest(PATH.prod + 'fonts'));
});

// clear cache
gulp.task('clear', function (callback) {
    return cache.clearAll();
})

gulp.task('watch', function() {
    gulp.watch(PATH.dev + 'styles/**/*.scss', gulp.parallel('sass')); 
    gulp.watch(PATH.dev + '**/*.html', gulp.parallel('html')); 
    gulp.watch([PATH.dev + 'js/**/*.js'], gulp.parallel('scripts')); 
});
gulp.task('default', gulp.parallel('sass', 'html', 'browser-sync', 'watch'));

// building and minify project 
gulp.task('build', gulp.parallel('clean', 'scripts', 'scripts-uglify', 'sass', 'css-minify', 'fonts', 'image'));