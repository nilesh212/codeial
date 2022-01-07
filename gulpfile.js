// import imagemin from "gulp-imagemin";

const gulp = require("gulp");

const sass = require("gulp-sass")(require("sass")); // change in command
const cssnano = require("gulp-cssnano");
const rev = require("gulp-rev");
const uglify = require("gulp-uglify-es").default;
const imagemin = require("gulp-imagemin");
const del = require("del");

/**
 * NOTE:
 * If rev-manifest.json does not have all the types of file even after doing "gulp build"
 * Then delete rev-manifest.json and try running the "gulp build" code again.
 */

gulp.task("css", function (done) {
  console.log("minifying css....");
  gulp
    .src("./assets/sass/**/*.scss")
    .pipe(sass())
    .pipe(cssnano())
    .pipe(gulp.dest("./assets.css"));

  gulp
    .src("./assets/**/*.css")
    .pipe(rev())
    .pipe(gulp.dest("./public/assets"))
    .pipe(
      rev.manifest({
        cwd: "public",
        merge: true,
      })
    )
    .pipe(gulp.dest("./public/assets"));

  done();
});

gulp.task("js", function (done) {
  console.log("minifying js.......");
  gulp
    .src("./assets/**/*.js")
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest("./public/assets"))
    .pipe(
      rev.manifest({
        cwd: "public",
        merge: true,
      })
    )
    .pipe(gulp.dest("./public/assets"));

  done();
});

gulp.task("images", function (done) {
  console.log("compressing images........");
  gulp
    .src("./assets/**/*.+(png|jpg|gif|svg|jpeg)")
    .pipe(imagemin())
    .pipe(rev())
    .pipe(gulp.dest("./public/assets"))
    .pipe(
      rev.manifest({
        cwd: "public",
        merge: true,
      })
    )
    .pipe(gulp.dest("./public/assets"));

  done();
});

//empty the public/assets directory
// because when running this file, it should start from scratch
gulp.task("clean:assets", function (done) {
  del.sync("./public/assets");
  done();
});

// all the tasks should be run independently
gulp.task(
  "build",
  gulp.series("clean:assets", "css", "js", "images"),
  function (done) {
    console.log("Building assets");
    done();
  }
);
