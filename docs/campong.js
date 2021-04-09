const node = document;
node.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft"||event.key === "a") {
        move_striker(strikerr,-1,0);

    }
    else if (event.key === "ArrowRight"||event.key === "d") {
        move_striker(strikerr,1,0);
    }
    else if (event.key === "ArrowUp"||event.key === "w") {
        move_striker(strikerr,0,-1);

    }
    else if (event.key === "ArrowDown"||event.key === "s") {
        move_striker(strikerr,0,1);

    }

});

const argFact = (compareFn) => (array) => array.map((el, idx) => [el, idx]).reduce(compareFn)[1]
const argMax = argFact((min, el) => (el[0] > min[0] ? el : min))
const argMin = argFact((max, el) => (el[0] < max[0] ? el : max))

class Striker{
    constructor(px,py,w,h,vx,vy){
        this.px = px;
        this.py = py;
        this.w = w;
        this.h = h;
        this.vx = vx;
        this.vy = vy;
        this.color = [255,0,255,255];
    }
}
class Scores{
    constructor(left,right){
        this.left = left;
        this.right = right;
    }
}
class Disk {
  constructor(radius,px,py,vx,vy) {
    this.radius = radius;
    this.px = px;
    this.py = py;
    this.vx = vx;
    this.vy = vy;
    this.color = [0,255,0,255];
  }
}

class Field {
  constructor(w,h,border_x,border_y,goal_w,goal_h) {
    this.w = w;
    this.h = h;
    this.border_x = border_x;
    this.border_y = border_y;
    this.goal_h = goal_h;
    this.goal_w = goal_w;
    this.TOP = border_y;
    this.DOWN = h-border_y;
    this.LEFT = border_x;
    this.RIGHT = w-border_x;
    this.VMID = Math.floor(this.h/2);
    this.HMID = Math.floor(this.w/2);
    this.FIELD_COLOR = [255,255,255,255];
    this.TOP_LEFT = new cv.Point(border_x,border_y);
    this.BOTTOM_RIGHT = new cv.Point(w-border_x,h-border_y);
    this.TOP_GOAL = Math.floor(h/2)-Math.floor(goal_h/2)
    this.BOTTOM_GOAL = Math.floor(h/2)+Math.floor(goal_h/2);
    this.LEFT_GOAL_L = border_x-Math.floor(goal_w/2)
    this.LEFT_GOAL_R = border_x+Math.floor(goal_w/2)
    this.TL_LEFT_GOAL = new cv.Point(this.LEFT_GOAL_L,this.TOP_GOAL);
    this.BR_LEFT_GOAL = new cv.Point(this.LEFT_GOAL_R,this.BOTTOM_GOAL);

    this.RIGHT_GOAL_L = w-border_x-Math.floor(goal_w/2);
    this.RIGHT_GOAL_R =  w-border_x+Math.floor(goal_w/2);
    this.TL_RIGHT_GOAL = new cv.Point(this.RIGHT_GOAL_L,this.TOP_GOAL);
    this.BR_RIGHT_GOAL = new cv.Point(this.RIGHT_GOAL_R,this.BOTTOM_GOAL);
    this.LEFT_GOAL_COLOR = [255,0,0,255];
    this.RIGHT_GOAL_COLOR = [0,0,255,255];
    }
}


function drawField(frame,obj){
    cv.rectangle(frame,obj.TOP_LEFT,obj.BOTTOM_RIGHT,obj.FIELD_COLOR,2);
    cv.rectangle(frame,obj.TL_LEFT_GOAL,obj.BR_LEFT_GOAL,obj.LEFT_GOAL_COLOR,3);
    cv.rectangle(frame,obj.TL_RIGHT_GOAL,obj.BR_RIGHT_GOAL,obj.RIGHT_GOAL_COLOR,3);
}

const canvasElement = document.getElementById('canvas');
var inside = false; // to know if the is inside the ball and has not bounced yet
var streaming=true;
var cfg={
    low_th:30,
    high_th:255,
    color:'R',
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
    }
};
let video = document.getElementById('video');//document.getElementById('webcam');
let cap = new cv.VideoCapture(video);

let gui = new dat.GUI({ autoPlace: true, width: 450 });
var cfgFolder = gui.addFolder('configuration');

cfgFolder.add(cfg, 'low_th', 0, 255).name('low_th').step(1);
cfgFolder.add(cfg, 'high_th', 0, 255).name('high_th').step(1);
cfgFolder.add(cfg, 'color', ['R','G','B']);
// add preview frame selector : gray, binary, color layer, identification, original, etc
// take first frame of the video
let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
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
const FPS = 30;
let rgbaPlanes = new cv.MatVector();
let the_color = rgbaPlanes.get(0);
let dst = new cv.Mat();
let mask = new cv.Mat();
let dtype = -1;
let out_frame = dst;//frame,hsv;
let bot_counter = 0;
let bot_difficulty = 0; //lower is harder

function processVideo() {
    try {
        if (!streaming) {
            // clean and stop.
            frame.delete();out_frame.delete();
            dst.delete(); rgbaPlanes.delete();
            the_color.delete();mask.delete();
            return;
        }
        let begin = Date.now();

        // start processing.
        cap.read(frame);
        // Split the Mat
        cv.split(frame, rgbaPlanes);
        // Get the_color channel
        cv.cvtColor(frame, gray, cv.COLOR_RGBA2RGB);
        cv.cvtColor(gray, gray, cv.COLOR_RGB2GRAY);

        the_color = rgbaPlanes.get(cfg.get_color());
        cv.subtract(the_color, gray, dst, mask, dtype);
        cv.threshold(dst, dst, Math.min(cfg.low_th,cfg.high_th), Math.max(cfg.low_th,cfg.high_th), cv.THRESH_BINARY);
        out_frame = dst;
        cv.cvtColor(out_frame,out_frame, cv.COLOR_GRAY2RGB);
        cv.flip(out_frame, out_frame, 1);// important that this is before object drawing
        drawField(out_frame,field);
        bounceFromRect(puck,strikerr,inside,field);
        bounceFromRect(puck,strikerl,inside,field);
        moveObject(puck);
        bot_counter=botsify(strikerl,puck,bot_difficulty,bot_counter);
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
function drawBall(ball,frame){
    cv.circle(frame,new cv.Point(ball.px,ball.py),ball.radius,ball.color,ball.radius);
}

function move_striker(striker,signx,signy){
    striker.py = striker.py + signy*striker.vy;
    striker.px = striker.px + signx*striker.vx;
}
function drawRectFromCenter(obj,frame){
    let top_left = new cv.Point(obj.px-Math.floor(obj.w/2),obj.py-Math.floor(obj.h/2));
    let bottom_right = new cv.Point(obj.px+Math.floor(obj.w/2),obj.py+Math.floor(obj.h/2));
    cv.rectangle(frame,top_left,bottom_right,obj.color,3);
}
function moveObject(obj){
    obj.px = obj.px + obj.vx;
    obj.py = obj.py + obj.vy;
}

function bounceFromField(obj,field){
    // TOP
    if (obj.py-obj.radius <= field.TOP){
        obj.vy = Math.abs(obj.vy);
    }
    //DOWN
    if (obj.py+obj.radius >= field.DOWN){
        obj.vy = -1*Math.abs(obj.vy);
    }
    //LEFT
    if (obj.px-obj.radius <= field.LEFT){
        obj.vx = Math.abs(obj.vx);
    }
    //RIGHT
    if (obj.px+obj.radius >= field.RIGHT){
        obj.vx = -1*Math.abs(obj.vx);
    }
}

function bounceFromRect(disk,rect,inside,field){

    dir_x = get_sign(disk.px - rect.px);
    dir_y = get_sign(disk.py - rect.py);
    var collision,edge;
    [collision,edge] = checkCircleRectCollision(disk,rect);

    if (collision)
    {
        if (rect.px > field.w/2){// right striker, go left
            disk.vx = -1*Math.abs(disk.vx);
        }
        else {
            disk.vx = Math.abs(disk.vx); //left striker, go right
        }
        disk.color = [255,0,255,255];

        if (rect.py != field.h/2){
            disk.vy = disk.vy;
        }
        // else { //ball down, go down
        //     disk.vy = -1*Math.abs(disk.vy);
        // }
        disk.color = [255,0,255,255];

    }
    else{
        disk.color = [0,255,0,255];
    }

    // console.log(collision);
    // if (collision && !inside)
    // {
    //     inside = true;
    //     disk.color = [255,0,255,255];
    //     //console.log("collision");
    //     if (edge==0){disk.vx = -1*dir_x*disk.vx;
    //     disk.vy = -1*dir_y*disk.vy;}
    //     else if (edge==1){//left
    //         disk.vx = -1 * Math.abs(disk.vx);
    //     }
    //     else if (edge==2){//right
    //         disk.vy = -1 * Math.abs(disk.vy);
    //     }
    //     else if (edge==3){//top
    //         disk.vx = 1 * Math.abs(disk.vx);
    //     }
    //     else if (edge==4){//bottom
    //         disk.vy = 1 * Math.abs(disk.vy);
    //     }
    // }else {
    //     if (collision==false){
    //         inside = false;
    //     }
    //     disk.color = [0,255,0,255];
    // }
}

function checkCircleRectCollision(disk,rect,tol=5){
    //http://www.jeffreythompson.org/collision-detection/circle-rect.php
    // temporary variables to set edges for testing
    let cx = disk.px;
    let cy = disk.py;
    let rx = rect.px-rect.w/2;
    let ry = rect.py-rect.h/2;
    let rw = rect.w;
    let rh = rect.h;
    let testX = cx;
    let testY = cy;
    var radius = disk.radius;
    var edgeX = 0;
    var edgeY = 0;
    // which edge is closest?
    if (cx < rx)         {testX = rx;edgeX=1;}      // test left edge
    else if (cx > rx+rw) {testX = rx+rw;edgeX=3;}   // right edge
    if (cy < ry)         {testY = ry;edgeY=2;}      // top edge
    else if (cy > ry+rh) {testY = ry+rh;edgeY=4;}   // bottom edge

    // get distance from closest edges
    var distX = cx-testX;
    var distY = cy-testY;
    var edge = 0;
    if (distX <= distY)
    {
        edge = edgeX;
    }
    else{
        edge = edgeY;
    }
    if (Math.abs(distX-distY)<=tol){
        edge =0;//vertice
    }
    var distance = Math.sqrt( (distX*distX) + (distY*distY) );
    //console.log(distance,radius);

    // if the distance is less than the radius, collision!
    if (distance <= radius) {
    return [true,edge];
    }
    return [false,edge];
    }

function velocify(obj,threshold=10,max=10){
    vel = 0;
    obj.vx = plusOrMinus()* getRandomArbitrary(5,max);
    obj.vy= plusOrMinus()* getRandomArbitrary(1,max);
    vel = Math.sqrt(obj.vx*obj.vx+obj.vy*obj.vy);
    if (vel<threshold){
        idx = argMin([obj.vx,obj.vy]);
        if (idx == 0){
            obj.vx = threshold*get_sign(obj.vx);
        }
        else {
            obj.vy = threshold*get_sign(obj.vy);
        }
    }
}

function get_sign(num){
    if (num>=0){
        return 1;
    }
    else{
        return -1;
    }
}
function center(obj,w,h){
    obj.px = Math.floor(w/2);
    obj.py = Math.floor(h/2);
}

function detectScore(scores,ball,field){
    if (field.TOP_GOAL <= ball.py && ball.py <= field.BOTTOM_GOAL)
    {
        if (ball.px - ball.radius <= field.LEFT_GOAL_L + field.goal_w/2){ //goal at left,right scores
            scores.right +=1;
            center(ball,field.w,field.h);
            velocify(ball);
            console.log("inside zone l");
            console.log(ball.px);

        }
        if (ball.px + ball.radius >= field.RIGHT_GOAL_R - field.goal_w/2){ //goal at right,left scores
            scores.left +=1;
            center(ball,field.w,field.h);
            velocify(ball);
            console.log("inside zone r");
            console.log(ball.px);

        }

    }

}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function plusOrMinus(){
    return Math.random() < 0.5 ? -1 : 1;
}

function get_shape(a){
    return [a.length,a[0].length];
}

function get_pixel(src){
    let row = src.matSize[0], col = src.matSize[1];
    if (src.isContinuous()) {
        let R = src.data[row * src.cols * src.channels() + col * src.channels()];
        let G = src.data[row * src.cols * src.channels() + col * src.channels() + 1];
        let B = src.data[row * src.cols * src.channels() + col * src.channels() + 2];
        let A = src.data[row * src.cols * src.channels() + col * src.channels() + 3];
        return [R,G,B,A]
    }
}

function botsify(striker,ball,difficulty,counter){

    if (counter >= difficulty){
    let diff = ball.py - striker.py;
    if (diff > 0){
        move_striker(striker,0,1);
    }
    else{
        move_striker(striker,0,-1);
    }
    counter = 0;
    }
    else{
        counter += 1;
    }
    return counter
    
}