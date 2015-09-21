var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	concat = require('gulp-concat'),
	rename = require('gulp-rename'),
	browserSync = require('browser-sync').create(),
	uglify = require('gulp-uglify'),
	minifyCss = require('gulp-minify-css'),
	jasmine = require('gulp-jasmine');

// Jasmine Testing
gulp.task('test', function(){
	console.log((new Date).toLocaleTimeString() + " Tests Excecuted!");
	return gulp.src('spec/test.js')
		.pipe(jasmine());
});

// Linting and minifying
gulp.task('js-liniting-compliling', 
	function(){
		console.log((new Date).toLocaleTimeString() + " ReMinified JS!");
		return gulp.src('scripts/*.js')
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(concat('all.js'))
		.pipe(gulp.dest('dist/js'))
		.pipe(rename('all.min.js'))
		.pipe(uglify())
		.pipe(gulp.dest('dist/js'), 
	browserSync.reload());
});

gulp.task('js-watch', ['js-liniting-compliling']);

gulp.task('server', function(){
	browserSync.init({
		server: {
			baseDir: "./"
		}
	});
	gulp.watch("scripts/*.js", ['js-watch']);
	gulp.watch("styles/*.css", ['minify-css']);
});

//minify css
gulp.task('minify-css', 
	function() {
		console.log((new Date).toLocaleTimeString() + " ReMinified CSS!");
		return gulp.src('styles/*.css')
		.pipe(minifyCss())
		.pipe(gulp.dest('dist/styles'),
	browserSync.reload());
});

