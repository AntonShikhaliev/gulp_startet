const {src, dest, parallel, series, watch, registry} = require('gulp');
const sass = require('gulp-sass');
const notify = require('gulp-notify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const svgSprite = require('gulp-svg-sprite');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fs = require('fs');
const del = require('del');


// --- fonts --- 

const fonts = () =>{
    src('./src/fonts/**.ttf')
        .pipe(ttf2woff())
        .pipe(dest('./app/fonts/'))
    return src('./src/fonts/**.ttf')
        .pipe(ttf2woff2())
        .pipe(dest('./app/fonts/'))
}


const chackWeight = (fontname) =>{
    let weight = 400;
    switch (true) {
        case /Thin/.test(fontname):
            weight = 100;
            break; 
        case /ExrtraLight/.test(fontname):
            weight = 200;
            break;
        case /Light/.test(fontname):
            weight = 300;
            break;
        case /Regular/.test(fontname):
            weight = 400;
            break;
        case /Medium/.test(fontname):
            weight = 500;
            break;
        case /SemiBold/.test(fontname):
            weight = 600;
            break;
        case /Semi/.test(fontname):
            weight = 600;
            break;
        case /Bold/.test(fontname):
            weight = 700;
            break;    
        case /Black/.test(fontname):
            weight = 900;
            break;      

        default:
            weight = 400;
    }
    return weight;
}

const cb = () =>{}

let srcFonts = './src/scss/_fonts.scss';
let appFonts = './app/fonts';

const fontsStyle = (done) =>{
    let file_content = fs.readFileSync(srcFonts);
    fs.writeFile(srcFonts, '', cb);
    fs.readdir(appFonts, function (err, items) {
        if (items){
            let c_fontname;
            for (var i = 0; i < items.length; i++){
                let fontname = items[i].split('.');
                fontname = fontname[0];
                let font = fontname.split('-')[0];
                let weight = chackWeight(fontname);

                if (c_fontname != fontname){
                    fs.appendFile(srcFonts, '@include font-face("' + font + '", "' + fontname + '", '+ weight +');\r\n', cb);
                }
                c_fontname = fontname;
            }
        }
    })
    done();
}



// --- sass --- 

const styles = () => {
    return src('./src/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            outputStyle: 'expanded'
        }
        ).on('error', notify.onError()))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(autoprefixer({
            cascade: false,
        }))
        // .pipe(cleanCSS({level: 2}))
        .pipe(sourcemaps.write('.'))
        .pipe(dest('./app/css'))
        .pipe(browserSync.stream());
}

// --- html --- 

const htmlInclude = () =>{
    return src(['./src/index.html'])
    .pipe(fileinclude({
        prefix: '@',
        basepath: '@file'
    }))
    .pipe(dest('./app'))
    .pipe(browserSync.stream());
}

// --- JS --- 

const jsInclude = () =>{
    return src(['./src/js/main.js'])
    .pipe(fileinclude({
        prefix: '@',
        basepath: '@file'
    }))
    .pipe(dest('./app/js'))
    .pipe(browserSync.stream());
}


// --- img ---

const imgToApp = () =>{
    return src(['./src/img/*.jpg', './src/img/*.png', './src/img/*.jpeg', './src/img/*.svg'])
        .pipe(dest('./app/img/'));
}


// --- svg sprite ---
 const svgSprites = () =>{
     return src('./src/img/svg/*.svg')
     .pipe(svgSprite({
         mode: {
             stack:{
                 sprite: "../sprite.svg"
             }
         },
     }))
     .pipe(dest('./app/img/'));
 } 


// --- old  img ---

const oldImgToApp = () =>{
    return src('./src/img/*.+(jpg|png|svg|jpeg)')
        .pipe(dest('./app/img/'));
}


// --- resources --- 

const resources = () => {
    return src('./src/resources/**')
     .pipe(dest('./app'));
}




// --- clean ---


const clean = () => {
	return del(['app/*'])
}




// --- browserSync --- 
const watchFiles = () => {
    browserSync.init({
        server: {
            baseDir: "./app"
        },
        notify: false
    });

    watch('./src/scss/**/*.scss', styles);
    watch('./src/index.html', htmlInclude);
    // watch('./src/img/*.jpg', imgToApp);
    // watch('./src/img/*.jpeg', imgToApp);
    // watch('./src/img/*.png', imgToApp);
    // watch('./src/img/*.svg', imgToApp);
    watch('./src/img/svg/*.svg', svgSprites);
    watch('./src/resources/**', resources);
    watch('./src/fonts/**.ttf', fonts);
    watch('./src/fonts/**.ttf', fontsStyle);
    watch('./src/js/main.js', jsInclude);
    watch('./src/img/*.+(jpg|png|svg|jpeg)', oldImgToApp);

}



exports.styles = styles;
exports.watchFiles = watchFiles;
exports.fileinclude = htmlInclude;

exports.default = series(clean, parallel(htmlInclude, fonts, svgSprites, oldImgToApp,  resources, jsInclude), fontsStyle, styles, watchFiles);

