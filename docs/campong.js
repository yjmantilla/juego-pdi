//-----------------------------------------------------------------------------------------------
//-------Funciones de Procesamiento De Imagenes del Juego----------------------------------------
//-----------------------------------------------------------------------------------------------
//-------------Alexis Rafael del Carmen Ávila Ortiz--------CC 1083555169-------------------------
//------------ alexis.avila@udea.edu.co--------------------Wpp 305 2230574-----------------------
//-----------------------------------------------------------------------------------------------
//-------------Yorguin José Mantilla Ramos-----------------CC 1127617499-------------------------
//-------------yorguinj.mantilla@udea.edu.co---------------Wpp 311 5154452-----------------------
//-----------------------------------------------------------------------------------------------
//----------------------Estudiantes Facultad de Ingenieria  -------------------------------------
//--------Curso Básico de Procesamiento de Imágenes y Visión Artificial--------------------------
//---------------------------Abril de 2021-------------------------------------------------------
//-----------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------

// const node = document;
// node.addEventListener("keydown", function(event) {
//     if (event.key === "ArrowLeft"||event.key === "a") {
//         move_striker(strikerr,-1,0);

//     }
//     else if (event.key === "ArrowRight"||event.key === "d") {
//         move_striker(strikerr,1,0);
//     }
//     else if (event.key === "ArrowUp"||event.key === "w") {
//         move_striker(strikerr,0,-1);

//     }
//     else if (event.key === "ArrowDown"||event.key === "s") {
//         move_striker(strikerr,0,1);

//     }

// });


const canvasElement = document.getElementById('canvas');
var streaming=true;
var cfg={
    low_th:30,
    high_th:255,
    color:'R',
    frame:'raw',
    segmentation:'none',
    get_color:function(){
        if(this.color=='R'){
            return 0;
        }
        else if(this.color=='G'){
            return 1;
        }
        else if(this.color=='B')
        {
            return 2;
        }
    },
    circle_detector:{dp:1,minDist:45,high_th:75,accum_th:40,minR:1,maxR:640}
};
let video = document.getElementById('video');//document.getElementById('webcam');
let cap = new cv.VideoCapture(video);

let gui = new dat.GUI({ autoPlace: true, width: 450 });
var cfgFolder = gui.addFolder('configuration');
var circleFolder = gui.addFolder('circle detector');
cfgFolder.add(cfg, 'low_th', 0, 255).name('low_th').step(1);
cfgFolder.add(cfg, 'high_th', 0, 255).name('high_th').step(1);
cfgFolder.add(cfg, 'color', ['R','G','B']);
cfgFolder.add(cfg, 'frame', ['raw','lab','grey','subtract','binary','morph']);
cfgFolder.add(cfg, 'segmentation', ['none','hough','contours']);

circleFolder.add(cfg.circle_detector,'dp',1,2).name('dp').step(1);
circleFolder.add(cfg.circle_detector,'minDist',1,640).name('minDist').step(1);
circleFolder.add(cfg.circle_detector,'high_th',1,100).name('high_th').step(1);
circleFolder.add(cfg.circle_detector,'accum_th',1,100).name('accum_th').step(1);
circleFolder.add(cfg.circle_detector,'minR',1,640).name('minR').step(1);
circleFolder.add(cfg.circle_detector,'maxR',1,640).name('maxR').step(1);

// add preview frame selector : gray, binary, color layer, identification, original, etc
// take first frame of the video
let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
let lab = new cv.Mat(video.height, video.width, cv.CV_8UC4);
cap.read(frame);


let gray = new cv.Mat(video.height, video.width, cv.CV_8UC3);
var puck = new Disk(5,200,200,0,0);
var field = new Field(640,480,5,5,5,200);
var scores = new Scores(0,0);
var striker_margin = 5;
velocify(puck);
var striker_vel = 5;
var strikerl = new Striker(field.LEFT_GOAL_R + striker_margin,field.VMID,Math.floor(field.w/10),Math.floor(field.goal_h/3),striker_vel,striker_vel);
var strikerr = new Striker(field.RIGHT_GOAL_L- striker_margin,field.VMID,Math.floor(field.w/10),Math.floor(field.goal_h/3),striker_vel,striker_vel);
//var strikerr = new Striker(field.LEFT_GOAL_R + striker_margin,field.VMID,Math.floor(field.w/10),Math.floor(field.goal_h/3),striker_vel,striker_vel);

const FPS = 30;
let rgbaPlanes = new cv.MatVector();
let labPlanes = new cv.MatVector();
let the_color = rgbaPlanes.get(0);
let bin = new cv.Mat(video.height, video.width, cv.CV_8UC3);
let morph = new cv.Mat(video.height, video.width, cv.CV_8UC3);

let dst = new cv.Mat();
let mask = new cv.Mat();
let l = new cv.Mat();
let a = new cv.Mat();
let b = new cv.Mat();

let dtype = -1;
let out_frame = dst;//frame,hsv;

function processVideo() {
    try {
        if (!streaming) {
            // clean and stop.
            frame.delete();out_frame.delete();
            dst.delete(); rgbaPlanes.delete();
            the_color.delete();mask.delete();
            contours.delete(); hierarchy.delete();  
            bin.delete();morph.delete();
            return;
        }
        let begin = Date.now();

        // start processing.
        cap.read(frame);

        cv.cvtColor(frame, lab, cv.COLOR_RGB2Lab);
        cv.split(lab,labPlanes)
        let tileGridSize = new cv.Size(8, 8);
        let clahe = new cv.CLAHE(40, tileGridSize);
        clahe.apply(labPlanes.get(0), labPlanes.get(0));
        cv.merge(labPlanes, lab);
        cv.cvtColor(lab, lab, cv.COLOR_Lab2RGB);

        // Split the Mat
        cv.split(lab, rgbaPlanes);
        // Get the_color channel

        //cv.cvtColor(frame, gray, cv.COLOR_RGBA2RGB);
        cv.cvtColor(lab, gray, cv.COLOR_RGB2GRAY);//gray

        the_color = rgbaPlanes.get(cfg.get_color());
        cv.subtract(the_color, gray, dst, mask, dtype);

        // FILTERING
        //cv.medianBlur(dst, dst, 11); //too slow
        let ksize = new cv.Size(7, 7);
        let anchor = new cv.Point(-1, -1);
        cv.blur(dst, dst, ksize, anchor, cv.BORDER_DEFAULT);

        //BINARIZATION
        cv.threshold(dst,   bin, Math.min(cfg.low_th,cfg.high_th), Math.max(cfg.low_th,cfg.high_th), cv.THRESH_BINARY);
        
        cv.blur(bin, dst, ksize, anchor, cv.BORDER_DEFAULT);

        //MORPHOLOGY (OPENING)
        ksize = new cv.Size(3,3);
        let M = cv.getStructuringElement(2,ksize,anchor);//cv.Mat.ones(5, 5, cv.CV_8U);
        // You can try more different parameters
        cv.morphologyEx(dst, morph, cv.MORPH_OPEN, M, anchor, 1,
                        cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
        // MORPHOLOGY (CLOSE)
        // You can try more different parameters
        cv.morphologyEx(morph, morph, cv.MORPH_CLOSE, M);
        if (cfg.frame=='raw'){
            out_frame=frame;
        }else if(cfg.frame=='lab'){
            out_frame==lab;
        }
        else if (cfg.frame=='grey'){
            out_frame = gray;
        }else if (cfg.frame=='subtract'){
            out_frame = the_color;
        }else if (cfg.frame=='binary'){
            out_frame = bin;
        }else if (cfg.frame=='morph'){
            out_frame = morph;
        }


        let circles = new cv.Mat();
        if (cfg.segmentation == 'hough'){
        // CIRCLES
        // let color = new cv.Scalar(255, 0, 0);
        cv.HoughCircles(morph, circles, cv.HOUGH_GRADIENT,
            cfg.circle_detector.dp, cfg.circle_detector.minDist, cfg.circle_detector.high_th,
            cfg.circle_detector.accum_th, Math.min(cfg.circle_detector.minR, cfg.circle_detector.maxR),
            Math.max(cfg.circle_detector.minR, cfg.circle_detector.maxR));
        }
        let contours = new cv.MatVector();
        let hierarchy = new cv.Mat();
        
        if (cfg.frame != 'morph'){
        cv.flip(out_frame, out_frame, 1);// important that this is before object drawing
        }
        cv.flip(morph, morph, 1);// important that this is before object drawing

        if (cfg.segmentation=='contours'){
        // CONTOURS
        // You can try more different parameters
        cv.findContours(morph, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);
        }

        //out_frame = lab;
        if (cfg.frame!='raw'){
        cv.cvtColor(out_frame,out_frame, cv.COLOR_GRAY2RGB);
    }


        if (cfg.segmentation=='hough'){
        // Paint circles (see hough)
        // console.log(circles.cols);
        for (let i = 0; i < circles.cols; ++i) {
            let x = circles.data32F[i * 3];
            let y = circles.data32F[i * 3 + 1];
            let radius = circles.data32F[i * 3 + 2];
            let center = new cv.Point(x, y);
            cv.circle(out_frame, center, radius, new cv.Scalar(0, 0, 255),15);
        }
    }

        if (cfg.segmentation=='contours'){
        // draw contours with random Scalar
        let max_contour = 0;
        let selected = 0; 
        for (let i = 0; i < contours.size(); ++i) {
            let cnt = contours.get(i);
                let Moments = cv.moments(cnt, false);
            let cx = Moments.m10/Moments.m00
            let cy = Moments.m01/Moments.m00
            if (max_contour < contours.get(i).rows){
                max_contour = contours.get(i).rows;
                strikerr.px = cx;
                strikerr.py = cy;
                selected = i;
            }
            
        }
        let center = new cv.Point(strikerr.px, strikerr.py);
        let radius = 30;//cfg.circle_detector.minR;
        let color = new cv.Scalar(255,0,0);

        cv.drawContours(out_frame, contours, selected, color, 1, cv.LINE_8, hierarchy, 100);
        cv.circle(out_frame, center, radius, color,15);

    }


        drawField(out_frame,field);
        bounceFromRect(puck,strikerl,field);
        bounceFromRect(puck,strikerr,field);
        moveObject(puck);
        botsify(strikerl,puck,field);
        detectScore(scores,puck,field);// detecting scores must be before bouncing from walls
        bounceFromField(puck,field);
        drawBall(puck,out_frame);
        drawRectFromCenter(strikerl,out_frame);
        drawRectFromCenter(strikerr,out_frame);
        d3.select('#scorel').text(scores.left);
        d3.select('#scorer').text(scores.right);

        //cv.imshow('canvasOut', out_frame);
        cv.imshow('canvasOut', out_frame);
        // schedule the next one.
        let delay = 1000/FPS - (Date.now() - begin);
        setTimeout(processVideo, delay);
    } catch (err) {
        console.log(err);
    }
};

// schedule the first one.
setTimeout(processVideo, 0);