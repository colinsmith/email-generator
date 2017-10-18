// ====================
// GULP PLUGINS
// ====================

const   gulp = require('gulp'),
        handlebars = require('gulp-compile-handlebars'),
        rename = require('gulp-rename'),
        imagemin = require('gulp-imagemin'),
        replace = require('gulp-replace'),
        zip = require('gulp-zip'),
        connect = require('gulp-connect'),
        entityconvert = require('gulp-entity-convert'),
        htmlbeautify = require('gulp-html-beautify'),
        clean = require('gulp-clean'),
        yaml = require('gulp-yaml'),
        map = require('map-stream')     

// ====================
// FILE PATHS
// ====================

const   path = {
            srcDir: './src',
            srcImageDir: './src/assets/images',
            srcPartialsDir: './src/assets/partials',
            srcDataDir: './src/assets/data',
            distDir: './dist',
            distImageDir: 'images/',
            relativeImageDir: 'assets/images/'
        };

// ====================
// DEFINITIONS & SETTINGS
// ====================

// Initialize Template data from YAML file
let templateData = {};

// Define HTMLBeautify settings
let formattingOptions = {
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

// ====================
// TASKS
// ====================

// Clean /dist directory
gulp.task('clean', () => {
    return gulp.src(path.distDir + '/*')
        .pipe(clean({force: false}));
});


// Read data from YAML and convert to JSON
gulp.task('data', () => {
    gulp.src(path.srcDataDir + '/*.ya{,m}l')
        .pipe(yaml({
            schema: 'DEFAULT_SAFE_SCHEMA'
        }))
        .pipe(map(function(file, done) {
            templateData = file.contents.toString();
            done(null, templateData);
        }))
});

// Compress project into a .zip payload
gulp.task('archive', () => {
    gulp.src('dist/**/*')
        .pipe(zip('payload.zip'))
        .pipe(gulp.dest('dist'))
});

// Compress images with image-min
gulp.task('images', () => {
    gulp.src(path.srcImageDir + '/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'))
});

// Create live-reload server for development
// Initializes on port 8000
gulp.task('connect', () => {
  connect.server({
    root: 'localhost',
    port: 8000,
    livereload: true
  });
});

// Main build task
gulp.task('template', ['clean', 'data', 'images', 'archive'], () => {

    let options = {
        // Ignore undefined partials
        ignorePartials: true,
        
        // Load partials from /src/partials/* directory
        batch: [path.srcPartialsDir],

        // Text transform uppercase helper
        helpers : {
            makeUppercase : function(str){
                return str.toUpperCase();
            },
            makeLowercase : function(str){
                return str.toLowerCase();
            }
        }
    };

    return gulp.src(path.srcDir + '/*.hbs')
        .pipe(handlebars(
            JSON.parse(templateData),
            options
        ))
        .pipe(rename({
            extname: ".html"
        }))
        .pipe(replace(
            path.srcImageDir,
            path.distImageDir
        ))
        .pipe(replace(
            path.relativeImageDir,
            path.distImageDir
        ))
        .pipe(entityconvert())
        .pipe(htmlbeautify(formattingOptions))
        .pipe(gulp.dest(path.distDir));
});

// Rebuild watch task
gulp.task('watch', () => {
  gulp.watch([path.srcDir + '/**/*'], ['template']);
});

// Default build task (compiles project + starts live reload server + listens for changes)
gulp.task('default', [ 'template', 'watch' ]);
