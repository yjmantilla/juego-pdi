//-----------------------------------------------------------------------------------------------
//--------Clases y Funciones Auxiliares del Juego------------------------------------------------
//-----------------------------------------------------------------------------------------------
//-------------Alexis Rafael del Carmen Ávila Ortiz--------CC 1083555169-------------------------
//------------ alexis.avila@udea.edu.co--------------------Wpp +57 305 2230574-------------------
//-----------------------------------------------------------------------------------------------
//-------------Yorguin José Mantilla Ramos-----------------CC 1127617499-------------------------
//-------------yorguinj.mantilla@udea.edu.co---------------Wpp +57 311 5154452-------------------
//-----------------------------------------------------------------------------------------------
//----------------------Estudiantes Facultad de Ingenieria  -------------------------------------
//--------Curso Básico de Procesamiento de Imágenes y Visión Artificial--------------------------
//---------------------------Abril de 2021-------------------------------------------------------
//-----------------------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------------------
//-------Definicion de Clases--------------------------------------------------------------------
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

//-----------------------------------------------------------------------------------------------
//-------Visualización de Objetos----------------------------------------------------------------
//-----------------------------------------------------------------------------------------------

function drawField(frame,obj){                                                          // Función que pinta el campo en un frame
    cv.rectangle(frame,obj.TOP_LEFT,obj.BOTTOM_RIGHT,obj.FIELD_COLOR,2);                // Pintar Bordes del Campo
    cv.rectangle(frame,obj.TL_LEFT_GOAL,obj.BR_LEFT_GOAL,obj.LEFT_GOAL_COLOR,3);        // Pintar área de gol Izquierda
    cv.rectangle(frame,obj.TL_RIGHT_GOAL,obj.BR_RIGHT_GOAL,obj.RIGHT_GOAL_COLOR,3);     // Pintar área de gol Derecha
}


function drawBall(ball,frame){                                                          // Funcion que pinta un disco/pelota cualquiera en un frame
    cv.circle(frame,new cv.Point(ball.px,ball.py),ball.radius,ball.color,ball.radius);  // Pintar el disco/pelota mediante opencv
}

function drawRectFromCenter(obj,frame){                                                             // Función que pinta un rectangulo a partir de las coordenadas de su centro, su ancho (w) y su altura (h)
    let top_left = new cv.Point(obj.px-Math.floor(obj.w/2),obj.py-Math.floor(obj.h/2));             // Definimos Punto Superior Izquierdo
    let bottom_right = new cv.Point(obj.px+Math.floor(obj.w/2),obj.py+Math.floor(obj.h/2));         // Definimos Punto Inferior Derecho
    cv.rectangle(frame,top_left,bottom_right,obj.color,3);                                          // Pintamos el rectangulo a partir de ambos puntos
}

function drawAll(out_frame,field,puck,strikerl,strikerr){
    drawField(out_frame,field);                                 // Pintar el campo
    drawBall(puck,out_frame);                                   // Pintar la pelota
    drawRectFromCenter(strikerl,out_frame);                     // Pintar raqueta del bot
    drawRectFromCenter(strikerr,out_frame);                     // Pintar raqueta del jugador
}

//-----------------------------------------------------------------------------------------------
//-------Lógica de Goles-------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
function detectScore(scores,ball,field,thr,max_vel){                            // Función que detecta que se ha tocado la línea de gol de algunas de las áreas de gol del campo
    if (field.TOP_GOAL <= ball.py && ball.py <= field.BOTTOM_GOAL)          // Verificamos si la pelota está frente a cualquiera de las áreas de gol
    {
        if (ball.px - ball.radius <= field.LEFT_GOAL_L + field.goal_w/2){   // Verificamos si la pelota sobrepasó el área de gol izquierda
            scores.right +=1;                                               // Concedemos punto al jugador derecho
            center(ball,field.w,field.h);                                   // Centramos la pelota para el saque
            velocify(ball,thr,max_vel);                                     // Damos una velocidad aleatoria a la pelota
        }
        if (ball.px + ball.radius >= field.RIGHT_GOAL_R - field.goal_w/2){  // Verificamos si la pelota sobrepasó el área de gol derecha
            scores.left +=1;                                                // Concedemos punto al jugador izquierdo
            center(ball,field.w,field.h);                                   // Centramos la pelota para el saque
            velocify(ball,thr,max_vel);                                     // Damos una velocidad aleatoria a la pelota
        }
    }
}


//-----------------------------------------------------------------------------------------------
//-------Lógica de Movimiento y Posicionamiento--------------------------------------------------
//-----------------------------------------------------------------------------------------------
function move_striker(striker,signx,signy){         // Funcion que mueve una raqueta dado el sentido de movimiento introducido (signx y signy)
    striker.py = striker.py + signy*striker.vy;     // Cambiamos la posición vertical de la raqueta dada su velocidad vertical
    striker.px = striker.px + signx*striker.vx;     // Cambiamos la posición horizontal de la raqueta dada su velocidad horizontal
}
function moveObject(obj){      // Función que mueve un objeto cualquier con posiciones y velocidades dadas en sus atributos
    obj.px = obj.px + obj.vx;  // Movemos el objeto en x 
    obj.py = obj.py + obj.vy;  // Movemos el objeto en y
}

function center(obj,w,h){      // Función que centra un objeto cualquiera dado un ancho (w) y una altura (h) completas del campo
    obj.px = Math.floor(w/2);  // Centramos en el eje horizontal
    obj.py = Math.floor(h/2);  // Centramos en el eje vertical
}

function velocify(obj,threshold=10,max=20){                 // Función que da una velocidad aleatoria que cumpla un resultante mínima dada por threshold y una velocidad máxima por componente dada por max
    obj.vx = plusOrMinus()* getRandomArbitrary(5,max);      // Damos una velocidad aleatoria en x
    obj.vy= plusOrMinus()* getRandomArbitrary(1,max);       // Damos una velocidad aleatoria en y
    vel = Math.sqrt(obj.vx*obj.vx+obj.vy*obj.vy);           // Calculamos la norma resultante de la velocidad
    if (vel<threshold){                                     // Verificamos si la velocidad es más pequeña que el umbral dado
        if (obj.vx <= obj.vy){                              // Si lo es vemos si la componente más pequeña es la x
            obj.vx = threshold*get_sign(obj.vx);            // Si la componente más pequeña es x, damos la máxima velocidad ahí
        }
        else {
            obj.vy = threshold*get_sign(obj.vy);            // Si la componente más pequeña es y, damos la máxima velocidad ahí
        }
    }
}

//-----------------------------------------------------------------------------------------------
//-------Lógica de Colisiones--------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
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

function bounceFromRect(disk,rect,field){                // Funcion que rebota una pelota/disco al chocar con un rectangulo dado
    var collision;                                              // Variable para guardar si hubo colisión o no
    collision = checkCircleRectCollision(disk,rect);            // Determinamos si hubo colisión
    if (collision)                                              // En caso de colisión...
    {
        if (rect.px > field.w/2){                               // Vemos si el choque fue con la raqueta derecha
            disk.vx = -1*Math.abs(disk.vx);                     // Si es así, rebotamos hacia la izquierda (velocidad negativa)
        }
        else {                                                  // De lo contrario el choque fue con la raqueta izquierda
            disk.vx = Math.abs(disk.vx);                        // En este caso rebotamos hacia la derecha (velocidad positiva)
        }
        disk.color = [255,0,255,255];                           // Damos un color Magenta a la pelota para tener una retroalimentación visual de cuando sucede la colisión
    }
    else{
        disk.color = [0,255,0,255];                             // Si no hubo colisión, dejamos el color original (Verde)
    }
}

function checkCircleRectCollision(disk,rect){                        // Función que determina si hay colisión entre un circulo y un rectangulo
                                                                     // Inspirada en http://www.jeffreythompson.org/collision-detection/circle-rect.php
    let cx = disk.px;                                                // Coordenada x del centro del circulo
    let cy = disk.py;                                                // Coordenada x del centro del circulo
    let rx = rect.px-rect.w/2;                                       // Coordenada x de la esquina superior izquierda del rectangulo
    let ry = rect.py-rect.h/2;                                       // Coordenada y de la esquina superior izquierda del rectangulo
    let rw = rect.w;                                                 // Ancho del rectangulo
    let rh = rect.h;                                                 // Altura del rectangulo
    
    let testX = cx;                                                  // Variable auxiliar que va a guardar la coordenada "x" del borde 
                                                                     // más cercano al disco, inicializado en la posición del centro
                                                                     // del disco por si este esta dentro del rectangulo

    let testY = cy;                                                  // Variable auxiliar que va a guardar la coordenada "y" del borde
                                                                     // más cercano al disco, inicializado en la posición del centro
                                                                     // del disco por si este esta dentro del rectangulo

    var radius = disk.radius;                                        // Radio del disco

                                                                     // Descubrimos cual es el borde más cercano al disco en lo que sigue:

    if (cx < rx)         {testX = rx;}                               // Si el centro.x del disco esta antes del borde izquierdo, la colisión se dió en el borde izquierdo (rx)
    else if (cx > rx+rw) {testX = rx+rw;}                            // Si el centro.x del disco esta luego del borde derecho, la colisión se dió en el borde derecho (rx+rw)
                                                                     // De lo contrario estamos dentro del rango horizontal del rectangulo

    if (cy < ry)         {testY = ry;}                               // Si el centro.y del disco esta antes del borde superior, la colisión se dió en el borde superior (ry)
    else if (cy > ry+rh) {testY = ry+rh;}                            // Si el centro.y del disco esta luego del borde inferior, la colisión se dió en el borde inferior (ry+rh)
                                                                     // De lo contrario estamos dentro del rango vertical del rectangulo

                                                                     // Obtenemos la distancia del centro del disco al borde más cercano del rectángulo
    var distX = cx-testX;                                            // Distancia horizontal, si esta dentro del rango "x" del rectangulo será 0
    var distY = cy-testY;                                            // Distancia vertical, si esta dentro del rango "y" del rectangulo será 0

    var distance = Math.sqrt( (distX*distX) + (distY*distY) );       // Distancia del centro del disco al rectangulo, si da 0 quiere decir que es dentro del rectangulo

    if (distance <= radius) {                                        // Verificamos si la distancia es menor al radio del circulo
    return true;                                                     // En caso de que sí, hay colisión
    }
    return false;                                                    // De resto no.
    }

//-----------------------------------------------------------------------------------------------
//-------Inteligencia Artificial del Oponente----------------------------------------------------
//-----------------------------------------------------------------------------------------------
function botsify(striker,ball,field){
    let diff;                                                                // Función que mueve la raqueta de forma autónoma dada la raqueta,la pelota y el campo
                                                                             // La idea es que el bot iguale la posicion de la pelota si se encuentra de su lado, 
                                                                             // sino que vuelva al medio de su área
    if (get_sign(ball.px-field.HMID) == get_sign(striker.px-field.HMID)){    // Verificamos si la pelota se encuentra del lado del bot
        diff = ball.py - striker.py;                                         // Obtenemos la diferencia entre la posición vertical del bot y la pelota
    }
    else{
        diff = field.VMID - striker.py;                                      // Obtenemos la diferencia entre el centro.y del campo y la posición "y" del bot
    }

    if (diff ==0){                                                           // Si no hay diferencia no hay necesidad de moverse
        return
    }

    if (diff > 0){                                                           // Si es positiva...
        move_striker(striker,0,1);                                           // Movemos el bot hacia arriba
    }    
    else{                                                                    // De lo contrario
        move_striker(striker,0,-1);                                          // Movemos el bot hacia abajo
    }

}

//-----------------------------------------------------------------------------------------------
//-------Funciones Auxiliares--------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------
function get_sign(num){    // Función que obtiene el signo de un número representado por 1 o -1
    if (num>=0){           // Si es número es mayor o igual a 0
        return 1;          // signo positivo (1)
    }
    else{                  // De lo contrario es negativo
        return -1;         // signo negativo (-1)
    }
}

function getRandomArbitrary(min, max) {        // Función que retorna un número aleatorio en un rango de min a max
    return Math.random() * (max - min) + min;  // Obtiene un porcentaje del rango con el que desplazarse desde el valor mínimo
}

function plusOrMinus(){                        // Función que obtiene un signo aleatorio (positivo o negativo)
    return Math.random() < 0.5 ? -1 : 1;       // Simplemente desde una distribución normal si es mayor o menor a 0.5 (la mitad)
}

