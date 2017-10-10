const gulp = require('gulp'),
    handlebars = require('gulp-compile-handlebars'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    replace = require('gulp-replace'),
    zip = require('gulp-zip'),
    connect = require('gulp-connect'),
    entityconvert = require('gulp-entity-convert'),
    htmlbeautify = require('gulp-html-beautify'),
    clean = require('gulp-clean');

const path = {
    srcDir: './src',
    srcImageDir: './src/assets/images',
    srcPartialsDir: './src/assets/partials',
    srcDataDir: './src/assets/data',
    distDir: './dist',
    distImageDir: 'images/',
    relativeImageDir: 'assets/images/'
};

gulp.task('clean', function () {
    return gulp.src(path.distDir + '/*')
        .pipe(clean({force: false}));
});

gulp.task('archive', function () {
    gulp.src('dist/**/*')
        .pipe(zip('payload.zip'))
        .pipe(gulp.dest('dist'))
});

gulp.task('template', function () {

    var options = {
        // Ignore undefined partials
        ignorePartials: true,
        
        // Load partials from /src/partials/* directory
        batch: [path.srcPartialsDir]
    };

    var formattingOptions = {
        "indent_size": 2,
        "indent_char": " ",
        "indent_with_tabs": false,
        "eol": "\n",
        "end_with_newline": false,
        "indent_level": 0,
        "preserve_newlines": false,
        "max_preserve_newlines": 5,
        "space_in_paren": false,
        "space_in_empty_paren": false,
        "jslint_happy": false,
        "space_after_anon_function": false,
        "brace_style": "collapse",
        "unindent_chained_methods": false,
        "break_chained_methods": false,
        "keep_array_indentation": false,
        "unescape_strings": false,
        "wrap_line_length": 0,
        "e4x": false,
        "comma_first": false,
        "operator_position": "before-newline"
    };

    return gulp.src(path.srcDir + '/*.hbs')
        .pipe(handlebars(null, options))
        .pipe(rename({
            extname: ".html"
        }))
        .pipe(replace(path.srcImageDir, path.distImageDir))
        .pipe(replace(path.relativeImageDir, path.distImageDir))
        .pipe(entityconvert())
        .pipe(htmlbeautify(formattingOptions))
        .pipe(gulp.dest(path.distDir));
});

gulp.task('images', function () {
    gulp.src(path.srcImageDir + '/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'))
});

gulp.task('connect', function () {
  connect.server({
    root: 'localhost',
    port: 8000,
    livereload: true
  });
});

gulp.task('watch', function () {
  gulp.watch([path.srcDir + '/**/*'], ['template']);
});

gulp.task('build', [ 'clean', 'images', 'template', 'archive', 'watch' ]);
