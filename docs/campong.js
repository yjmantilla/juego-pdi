//-----------------------------------------------------------------------------------------------
//-------Funciones de Procesamiento De Imagenes del Juego----------------------------------------
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
//-------Configuración de Elementos HTML---------------------------------------------------------
//-----------------------------------------------------------------------------------------------
const canvasElement = document.getElementById('canvas');    // Obtenemos el elmento html 'canvas' donde se pintara todo
document.getElementById("video").style.display="none";      // Ocultar video original de la webcam, solo queremos que se muestre el canvas
const video = document.getElementById('video');             // Obtenemos el elemento html donde esta el video

//-----------------------------------------------------------------------------------------------
//-------Inicialización de lo Parámeros Configurables por el Usuario-----------------------------
//-----------------------------------------------------------------------------------------------
let game = {thr:15,max_vel:30};                             // Diccionario que configura propiedades del jueg
                                                            // Este diccionario define las propiedades y su valor inicial
                                                            // thr define la mínima velocidad en una sola componente (x o y)
                                                            // max_vel define la máxima norma (sqrt(x*x+y*y)) que puede tener la velocidad

let cfg={                                                   // Diccionario que define propiedades del procesamiento de imágenes
                                                            // Este diccionario define las propiedades y su valor inicial
    low_th:30,                                              // Umbral para el mínimo de intensidad en el proceso de binarización
    high_th:255,                                            // Umbral para el máximo de intensidad en el proceso de binarización
    color:'R',                                              // Color del objeto a detectar, debe ser 'R','G' o 'B'
    frame:'raw',                                            // Que imagen mostrar como fondo del juego
                                                            // Puede ser: 
                                                            // 'raw':cruda,
                                                            // 'blur':luego de transformacion rhb y difuminacion,
                                                            // 'the_color':capa del color elegida,
                                                            // 'grey':escala de grises,
                                                            // 'subtract':resta de la capa de color escogida - escala de grises,
                                                            // 'binary':binarizada por los umbrales,
                                                            // 'morph': luego de una difuminación y las transformaciones de morfologia
    segmentation: 'true',                                   // Indica si se hace el proceso de segmentación y reconocimiento o no
                                                            // Ya que se le da la opción al usuario de utilizar el teclado para mover su paleta
    blur_ksize:8,                                           // Tamaño del elemento estructurante para el blur
    morph_ksize:3,                                          // Tamaño del elemento estructurante para la morfología
    get_color:function(){                                   // Función que mapea colores a indices de un arreglo de color
        if(this.color=='R'){
            return 0;                                       // R:0
        }
        else if(this.color=='G'){
            return 1;                                       // G:1
        }
        else if(this.color=='B')
        {
            return 2;                                       // B:2
        }
    }
};

//-----------------------------------------------------------------------------------------------
//-------Configuración de la Interfaz de Parámetros del Juego------------------------------------
//-----------------------------------------------------------------------------------------------
let gui = new dat.GUI({ autoPlace: true, width: 450 });                         // Instancia de dat.GUI para generar un panel de configuracion para el juego
let gameFolder = gui.addFolder('Game');                                         // Carpeta de configuración de propiedades del juego
gameFolder.add(game, 'max_vel', 20, 50).name('max_vel').step(1);                // Configuración de la velocidad máxima
gameFolder.add(game, 'thr', 10, 20).name('thr').step(1);                        // Configuración de la mínima velocidad en una sola componente de la velocidad

let cfgFolder = gui.addFolder('Processing');                                                 // Carpeta de configuracion de propiedades del procesado de imágenes
cfgFolder.add(cfg, 'low_th', 0, 255).name('low_th').step(1);                                 // Configuración del Umbral para el mínimo de intensidad en el proceso de binarización
cfgFolder.add(cfg, 'high_th', 0, 255).name('high_th').step(1);                               // Configuración del Umbral para el máximo de intensidad en el proceso de binarización
cfgFolder.add(cfg, 'color', ['R','G','B']);                                                  // Configuración del color del objeto a detectar
cfgFolder.add(cfg, 'frame', ['raw','blur','the_color','grey','subtract','binary','morph']);  // Configuración de la imagen mostrar como fondo del juego
cfgFolder.add(cfg, 'blur_ksize', 2, 100).name('blur_ksize').step(1);                         // Configuracion del tamaño del elemento estructurante del blur
cfgFolder.add(cfg, 'morph_ksize', 2, 10).name('morph_ksize').step(1);                        // Configuracion del tamaño del elemento estructurante del para la morfología
cfgFolder.add(cfg, 'segmentation',['true','false']);                                         // Configurar si hacer el proceso de segmentación y reconocimiento o no


//-----------------------------------------------------------------------------------------------
//-------Instanciación de elementos del Juego----------------------------------------------------
//-----------------------------------------------------------------------------------------------
let puck = new Disk(5,200,200,0,0);                                 // Instancia de la pelota
let field = new Field(640,480,5,5,5,200);                           // Instancia del campo
let scores = new Scores(0,0);                                       // Instancia de los marcadores
let striker_margin = 0;                                             // Margen de las raquetas respecto a los bordes del campo
let striker_vel = 5;                                                // Velocidad de las raquetas
let strikerl = new Striker(field.LEFT_GOAL_R + striker_margin,      // Instanciación de la raqueta izquierda
    field.VMID,Math.floor(field.w/10),Math.floor(field.goal_h/3),
    striker_vel,striker_vel);
let  strikerr = new Striker(field.RIGHT_GOAL_L- striker_margin,     // Instanciación de la raqueta derecha
    field.VMID,Math.floor(field.w/10),Math.floor(field.goal_h/3),
    striker_vel,striker_vel);

    velocify(puck,game.thr,game.max_vel);                           // Dar velocidad Inicial a la pelota

//-----------------------------------------------------------------------------------------------
//-------Inicialización de Variables de OPENCV---------------------------------------------------
//-----------------------------------------------------------------------------------------------
const FPS = 30;                                                         // Frames por segundo a usar
let cap = new cv.VideoCapture(video);                                   // Instancia de la clase de captura de video de opencv
let streaming = true;                                                   // Booleano que indica si la camara esta transmitiendo video
let frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);          // Reserva de una matriz frame que es la captura de la imagen de un video en un tiempo especifico
                                                                        // RGBA: 4 canales de unsigned integer 8
let dummyFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);     // Reserva de la matriz auxiliar que irá guardando la imagen actual en cada momento
let the_color = new cv.Mat(video.height, video.width, cv.CV_8UC4);      // Reserva de una matriz que guardara unicamente la capa de color indicada por el usuario
let contours = new cv.MatVector();                                      // Vector de Matrices que contendrá contornos
let hierarchy = new cv.Mat();                                           // Matriz que guardará las jerarquías de esos contornos
let out_frame = new cv.Mat(video.height, video.width, cv.CV_8UC4);      // Reserva de una matriz que almacenará el fondo del campo proyectado en el juego
let rgbPlanes = new cv.MatVector();                                     // Reserva de un vector que guardara las capas de color de la imagen RGB por separado
//-----------------------------------------------------------------------------------------------
//-------Procesamiento de la imagen y su influencia en el juego----------------------------------
//-----------------------------------------------------------------------------------------------

function processVideo() {                               // Función que realiza todo el procesamiento
    try 
    {

//-------Inicialización, Reserva y Eliminación de Variables--------------------------------------


        if (!streaming) {                               // Si ya no se esta capturando video
            frame.delete();out_frame.delete();          // Borrar variables Inutilizadas
            rgbPlanes.delete();                         // Borrar variables Inutilizadas
            the_color.delete();                         // Borrar variables Inutilizadas
            dummyFrame.delete();                        // Borrar variables Inutilizadas
            contours.delete(); hierarchy.delete();      // Borrar variables Inutilizadas
            return;
        }

        let tileGridSize = new cv.Size(cfg.blur_ksize, cfg.blur_ksize);         // Tamaño del elemento estructurante para los blur

//-------Obtención de la Imagen Cruda------------------------------------------------------------

        cap.read(frame);                                        // Lectura del frame de la camara
        cv.flip(frame, frame, 1);                               // Giro en espejo del fondo, esto es para que concuerde 
                                                                // de forma intuitiva la imagen mostrada con la posición del usuario

        if (cfg.frame=='raw'){                                  // Seleccionar imagen cruda como fondo
            draw(frame,field,puck,strikerl,strikerr)            // Pintamos elementos del juego sobre la imagen
        }
        
//-------Conversion de RGBA a RGB----------------------------------------------------------------

        cv.cvtColor(frame, dummyFrame, cv.COLOR_RGBA2RGB);      // Conversión de RHBA a RGB


//-------Difuminación para eliminar ruido--------------------------------------------------------

        cv.blur(dummyFrame, dummyFrame, tileGridSize);          // Difuminación
        if(cfg.frame=='blur'){                                  // Verificar si el usuario marcó "blur" como fondo
            draw(dummyFrame,field,puck,strikerl,strikerr)       // Pintamos elementos del juego sobre la imagen
        }

//-------Búsqueda del objeto mediante uno de los canales RGB-------------------------------------
        cv.split(dummyFrame, rgbPlanes);                        // Separar la imagen RGB en los 3 canales

        cv.cvtColor(dummyFrame, dummyFrame, cv.COLOR_RGB2GRAY);      // Conversión de RGB a Escala de Grises
        if (cfg.frame=='grey'){                                      // Verificar si el usuario marcó "gray" para el fondo
            cv.cvtColor(dummyFrame,out_frame, cv.COLOR_GRAY2RGB);    // Conversión al espacio RGB para que no se vea a blanco y negro
            draw(out_frame,field,puck,strikerl,strikerr)             // Pintamos elementos del juego sobre la imagen
        }

        the_color = rgbPlanes.get(cfg.get_color());             // Obtener la capa marcada por el usuario en las opciones
        if (cfg.frame=='the_color'){                            // Verificar si el usuario marcó "the_color" para el fondo
                                                                // La idea es volver 0 las capas distintas al color que el usuario escogió
            let idxs = [0,1,2];                                 // Indices de los colores
            idxs.splice(cfg.get_color(),1);                     // Quitamos el indice correspondiente al color que el usuario escogió
            the_color.convertTo(out_frame, cv.CV_8UC1, 0, 0);   // Obtener una matriz de ceros en out_frame
            idxs.forEach(element => {                           // Ya eliminado el índice del color deseado, recorremos con un for
                rgbPlanes.set(element,out_frame);               // Volver cero los otros canales
            });
            cv.merge(rgbPlanes,out_frame);                      // Combinamos las capas RGB
            draw(out_frame,field,puck,strikerl,strikerr)        // Pintamos elementos del juego sobre la imagen
        }
        //cv.equalizeHist(the_color,the_color);                      // Ecualización del histograma de la capa de color seleccionada, no dió resulados relevantes...
        cv.subtract(the_color, dummyFrame, dummyFrame);              // Comparamos la capa de color seleccionado contra la escala de grises.
        if (cfg.frame=='subtract'){                                  // Verificar si el usuario marcó "subtract" para el fondo
            cv.cvtColor(dummyFrame,out_frame, cv.COLOR_GRAY2RGB);    // Conversión al espacio RGB
            draw(out_frame,field,puck,strikerl,strikerr)             // Pintamos elementos del juego sobre la imagen
        }

//-------Binarización según lo encontrado previamente--------------------------------------------

        cv.threshold(dummyFrame,dummyFrame, Math.min(cfg.low_th,cfg.high_th), Math.max(cfg.low_th,cfg.high_th), cv.THRESH_BINARY);      // Umbralización de la resta hecha
        if (cfg.frame=='binary'){                                    // Verificar si el usuario marcó "Binario" para el fondo
            cv.cvtColor(dummyFrame,out_frame, cv.COLOR_GRAY2RGB);    // Conversión al espacio RGB
            draw(out_frame,field,puck,strikerl,strikerr)             // Pintamos elementos del juego sobre la imagen
        }

//-------Otra Difuminación para eliminar más ruido-----------------------------------------------

        cv.blur(dummyFrame, dummyFrame, tileGridSize);               // 2da difuminación

//-------Procesamiento Morfológico para mejorar las figuras--------------------------------------

        let ksize = new cv.Size(cfg.morph_ksize,cfg.morph_ksize);    // Definición del tamaño del elemento estructurante para la morfología
        let M = cv.getStructuringElement(2,ksize);                   // En tal caso, seleccionar como fondo la resta calculada
        cv.morphologyEx(dummyFrame, dummyFrame, cv.MORPH_OPEN, M);   // Operación de Abrir para reducir ruido

        cv.morphologyEx(dummyFrame,dummyFrame, cv.MORPH_CLOSE, M);   // Operación de Cerrar para cerrar huecos.

        if (cfg.frame=='morph'){                                     // Verificar si el usuario marcó "morph" para el fondo
            cv.cvtColor(dummyFrame,out_frame, cv.COLOR_GRAY2RGB);    // Conversión al espacio RGB
            draw(out_frame,field,puck,strikerl,strikerr)
        }

//-------Segmentación de la Imagen---------------------------------------------------------------

        if (cfg.segmentation=='true'){                                                                                                  // Si el proceso de Segmentación esta activo

//-------Encontrar el contorno más grande con el color de nuestro marcador-----------------------

            cv.findContours(dummyFrame, contours, hierarchy, cv.RETR_CCOMP, cv.CHAIN_APPROX_SIMPLE);       // Encontramos los contornos de la imagen ya procesada por todos los pasos anteriores
                                                                                                           // Buscamos ahora el contorno más grande, que será en principio nuestro objeto que se desea identificar
            let max_contour = 0;                                                                           // Variable donde guardaremos el maximo contorno que hemos encontrado
            let selected = 0;                                                                              // Aquí guardaremos el índice del máximo contorno hallado
            
            for (let i = 0; i < contours.size(); ++i) {                                                    // Recorremos los contornos para saber cual es el mayor
                if (max_contour < contours.get(i).rows)                                                    // Si el contorno actual es mayor a nuestro mayor contorno encontrado hasta ahorita...
                    {
                    let cnt = contours.get(i);                                                             // Obtenemos el contorno actual
                    let Moments = cv.moments(cnt, false);                                                  // Calculamos los momentos de ese contorno
                    let cx = Moments.m10/Moments.m00                                                       // Inferimos centroide.x con los momentos
                    let cy = Moments.m01/Moments.m00                                                       // Inferimos centroide.y con los momentos
                    max_contour = contours.get(i).rows;                                                    // Reemplazamos nuestro contorno más grande encontrado
                    strikerr.px = cx;                                                                      // Colocamos la raqueta.x en el centroide.x
                    strikerr.py = cy;                                                                      // Colocamos la raqueta.y en el centroide.y
                    selected = i;                                                                          // Guardamos el contorno escogido en la variable selected
                    }
                
                }
            let color = new cv.Scalar(255,0,0);                                                            // Usaremos blanco para pintar el contorno
            cv.drawContours(out_frame, contours, selected, color, 1, cv.LINE_8, hierarchy, 100);           // Pintamos el contorno
            color=null                                                                                     // Eliminamos variable para conservar memoria
        }

//----Ya identificada la posición de la raqueta del usuario, seguimos con la logica del juego----

        bounceFromRect(puck,strikerl,field);                        // Rebotar la pelota de la raqueta del computador
        bounceFromRect(puck,strikerr,field);                        // Rebotar la pelota de la raqueta del usuario
        moveObject(puck);                                           // Mover la pelota
        botsify(strikerl,puck,field);                               // Mover el bot
        detectScore(scores,puck,field,game.thr,game.max_vel);       // Detectar Goles, debe hacer antes de rebotar con las paredes ya que si no solo rebotaria
        bounceFromField(puck,field);                                // Rebotar de las paredes
        document.getElementById('scorel').innerHTML=scores.left;    // Mostrar marcador del bot
        document.getElementById('scorer').innerHTML=scores.right;   // Mostrar marcador del jugador
        tileGridSize=null                                           // Eliminamos variable para conservar memoria
        ksize=null                                                  // Eliminamos variable para conservar memoria
        M=null                                                      // Eliminamos variable para conservar memoria

        requestAnimationFrame(processVideo);                        // Pasa a procesar el siguiente frame cuando el browser este listo
    } 
    catch (err) {                                                   // Esto es un mecanismo de control de errores
        console.log(err);                                           // Imprimir el error en consola
        //requestAnimationFrame(processVideo);                      // Si quisieramos seguir intentando descomentariamos esto, pero es más seguro parar
    }
};

document.addEventListener("keydown", function(event) {              // Función que se encargar de estar atenta a las teclas AWSD y Up Down Left Right para mover de otra forma la raqueta del usuario
    if (event.key === "ArrowLeft"||event.key === "a") {             // Si Left o A
        move_striker(strikerr,-1,0);                                // Movemos hacia la izquierda...

    }
    else if (event.key === "ArrowRight"||event.key === "d") {       // Si Right o D
        move_striker(strikerr,1,0);                                 // Movemos hacia la derecha...
    }
    else if (event.key === "ArrowUp"||event.key === "w") {          // Si Up o W
        move_striker(strikerr,0,-1);                                // Movemos hacia arriba...

    }
    else if (event.key === "ArrowDown"||event.key === "s") {        // Si Down o S
        move_striker(strikerr,0,1);                                 // Movemos hacia abajo

    }
});

requestAnimationFrame(processVideo);                                // Esta es realmente la línea que inicia todo al llamar a proceesVideo por primera vez, sin ella no se hiciera nada


function draw(frame,field,puck,strikerl,strikerr){
    let f;                                             // Variable auxiliar donde copiar el frame
    f = frame.clone();                                 // Clonar el frame para no alterar el espacio de memoria original
    drawAll(f,field,puck,strikerl,strikerr)            // Pintar elementos del juego
    cv.imshow('canvas',f);                          // Mostrar la imagen pintada en el canvas del html
    f.delete();                                        // Eliminamos variable para conservar memoria
}