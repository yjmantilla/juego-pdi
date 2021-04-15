//-----------------------------------------------------------------------------------------------
//--------Clases y Funciones Auxiliares del Juego------------------------------------------------
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

class Striker{                         // Clase que modela la "raqueta" de los jugadores
    constructor(px,py,w,h,vx,vy){      // Constructor de la clase
        this.px = px;                  // Posición Horizontal
        this.py = py;                  // Posición Vertical
        this.w = w;                    // Ancho de la raqueta
        this.h = h;                    // Altura de la raqueta
        this.vx = vx;                  // Velocidad en x de la raqueta
        this.vy = vy;                  // Velocidad en y de la raqueta
        this.color = [255,0,255,255];  // Color de la raqueta en RGBA: Magenta
    }
}
class Scores{                          // Clase que modela los Marcadores de ambos jugadores
    constructor(left,right){           // Constructor
        this.left = left;              // Goles del jugador de la izquierda
        this.right = right;            // Goles del jugador de la derecha
    }
}
class Disk {                           // Clase que modela el Disco/Pelota del juego
  constructor(radius,px,py,vx,vy) {    // Constructor
    this.radius = radius;              // Radio del disco
    this.px = px;                      // Posición horizontal
    this.py = py;                      // Posición vertical
    this.vx = vx;                      // Velocidad Horizontal
    this.vy = vy;                      // Velocidad Vertical
    this.color = [0,255,0,255];        // Color en RGBA : Verde
  }
}

class Field {                                                                // Clase que modela el campo de Juego
  constructor(w,h,border_x,border_y,goal_w,goal_h) {                         // Constructor
    this.w = w;                                                              // Ancho del campo
    this.h = h;                                                              // Altura del campo
    this.border_x = border_x;                                                // Margen horizontal del campo
    this.border_y = border_y;                                                // Margen vertical del campo
    this.goal_h = goal_h;                                                    // Largo del area de gol
    this.goal_w = goal_w;                                                    // Ancho del area de gol
    this.TOP = border_y;                                                     // Borde Superior del Campo
    this.DOWN = h-border_y;                                                  // Borde Inferior del Campo
    this.LEFT = border_x;                                                    // Borde Izquierdo del Campo
    this.RIGHT = w-border_x;                                                 // Borde Derecho del Campo
    this.VMID = Math.floor(this.h/2);                                        // Linea Horizontal en la mitad (Mitad Vertical)
    this.HMID = Math.floor(this.w/2);                                        // Linea Vertical en la mitad (Mitad Horizonal)
    this.FIELD_COLOR = [255,255,255,255];                                    // Color del Campo en RGBA: Negro
    this.TOP_LEFT = new cv.Point(border_x,border_y);                         // Esquina Superior Izquierdo del Campo
    this.BOTTOM_RIGHT = new cv.Point(w-border_x,h-border_y);                 // Esquina Inferior Derecho del Campo
    this.TOP_GOAL = Math.floor(h/2)-Math.floor(goal_h/2)                     // Borde Superior de las áreas de gol
    this.BOTTOM_GOAL = Math.floor(h/2)+Math.floor(goal_h/2);                 // Borde Inferior de las áreas de gol
    this.LEFT_GOAL_L = border_x-Math.floor(goal_w/2)                         // Borde Izquierdo del área de gol izquierda
    this.LEFT_GOAL_R = border_x+Math.floor(goal_w/2)                         // Borde Derecho del área de gol izquierda
    this.TL_LEFT_GOAL = new cv.Point(this.LEFT_GOAL_L,this.TOP_GOAL);        // Esquina Superior Izquierda del área de gol Izquierda 
    this.BR_LEFT_GOAL = new cv.Point(this.LEFT_GOAL_R,this.BOTTOM_GOAL);     // Esquina Inferior Derecha del área de gol Izquierda
    this.RIGHT_GOAL_L = w-border_x-Math.floor(goal_w/2);                     // Borde Izquierdoo del área de gol derecha
    this.RIGHT_GOAL_R =  w-border_x+Math.floor(goal_w/2);                    // Borde Derecho del área de gol derecha
    this.TL_RIGHT_GOAL = new cv.Point(this.RIGHT_GOAL_L,this.TOP_GOAL);      // Esquina Superior Izquierda del área de gol Derecha
    this.BR_RIGHT_GOAL = new cv.Point(this.RIGHT_GOAL_R,this.BOTTOM_GOAL);   // Esquina Inferior Derecha del área de gol Derecha
    this.LEFT_GOAL_COLOR = [255,0,0,255];                                    // Color en RGBA del área de gol Izquierda: Rojo
    this.RIGHT_GOAL_COLOR = [0,0,255,255];                                   // Color en RGBA del área de gol Derecha: Azul
    }
}


function drawField(frame,obj){                                                          // Función que pinta el campo en un frame
    cv.rectangle(frame,obj.TOP_LEFT,obj.BOTTOM_RIGHT,obj.FIELD_COLOR,2);                // Pintar Bordes del Campo
    cv.rectangle(frame,obj.TL_LEFT_GOAL,obj.BR_LEFT_GOAL,obj.LEFT_GOAL_COLOR,3);        // Pintar área de gol Izquierda
    cv.rectangle(frame,obj.TL_RIGHT_GOAL,obj.BR_RIGHT_GOAL,obj.RIGHT_GOAL_COLOR,3);     // Pintar área de gol Derecha
}


function drawBall(ball,frame){                                                          // Funcion que pinta un disco/pelota cualquiera en un frame
    cv.circle(frame,new cv.Point(ball.px,ball.py),ball.radius,ball.color,ball.radius);  // Pintar el disco/pelota mediante opencv
}

function move_striker(striker,signx,signy){         // Funcion que mueve una raqueta dado el sentido de movimiento introducido (signx y signy)
    striker.py = striker.py + signy*striker.vy;     // Cambiamos la posición vertical de la raqueta dada su velocidad vertical
    striker.px = striker.px + signx*striker.vx;     // Cambiamos la posición horizontal de la raqueta dada su velocidad horizontal
}
function drawRectFromCenter(obj,frame){                                                             // Función que pinta un rectangulo a partir de las coordenadas de su centro, su ancho (w) y su altura (h)
    let top_left = new cv.Point(obj.px-Math.floor(obj.w/2),obj.py-Math.floor(obj.h/2));             // Definimos Punto Superior Izquierdo
    let bottom_right = new cv.Point(obj.px+Math.floor(obj.w/2),obj.py+Math.floor(obj.h/2));         // Definimos Punto Inferior Derecho
    cv.rectangle(frame,top_left,bottom_right,obj.color,3);                                          // Pintamos el rectangulo a partir de ambos puntos
}
function moveObject(obj){      // Función que mueve un objeto cualquier con posiciones y velocidades dadas en sus atributos
    obj.px = obj.px + obj.vx;  // Movemos el objeto en x 
    obj.py = obj.py + obj.vy;  // Movemos el objeto en y
}

function bounceFromField(obj,field){        // Funcion que rebota un disco/pelota al chocar con los bordes de un campo
    if (obj.py-obj.radius <= field.TOP){    // Choque con el borde superior
        obj.vy = Math.abs(obj.vy);          // Colocamos la velocidad "y" hacia abajo (positiva)
    }
    if (obj.py+obj.radius >= field.DOWN){   // Choque con el borde inferior
        obj.vy = -1*Math.abs(obj.vy);       // Colocamos la velocidad "y" hacia arriba (negativa)
    }
    if (obj.px-obj.radius <= field.LEFT){   // Choque con el borde izquierdo
        obj.vx = Math.abs(obj.vx);          // Colocamos la velocidad "x" hacia la derecha (positiva)
    }
    if (obj.px+obj.radius >= field.RIGHT){  // Choque con el borde derecho
        obj.vx = -1*Math.abs(obj.vx);       // Colocamos la velocidad "x" hacia la izquierda (negativa)
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

function velocify(obj,threshold=10,max=20){
    vel = 0;
    obj.vx = plusOrMinus()* getRandomArbitrary(5,max);
    obj.vy= plusOrMinus()* getRandomArbitrary(1,max);
    vel = Math.sqrt(obj.vx*obj.vx+obj.vy*obj.vy);
    if (vel<threshold){
        if (obj.vx <= obj.vy){
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

function botsify(striker,ball,difficulty,counter){
    //MAKE BOT ONLY LOOK FOR BALL IF IN HIS SIDE
    //MAKE BOT RETURN TO CENTER WHEN BALL IN THE OTHER SIDE
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