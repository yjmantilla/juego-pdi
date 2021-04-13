%-----------------------------------------------------------------------------------------------
%------- PLANTILLA DE CÓDIGO -------------------------------------------------------------------
%------- Coceptos básicos de PDI----------------------------------------------------------------
%------- Integrantes:---------------------------------------------------------------------------
%-------------Alexis Rafael del Carmen Ávila Ortiz--------CC 1083555169-------------------------   
%------------ alexis.avila@udea.edu.co -------------------Wpp 305 2230574-----------------------
%-----------------------------------------------------------------------------------------------
%-------------Yorguin Jose Mantilla Ramos   --------------CC XXXXXXXXXX-------------------------
%-------------yorguinj.mantilla@udea.edu.co --------------Wpp 311 3405923-----------------------
%-----------------------------------------------------------------------------------------------
%------- --------------Estudiantes Facultad de Ingenieria  -------------------------------------
%------- Curso Básico de Procesamiento de Imágenes y Visión Artificial--------------------------
%------- -------------------Abril de 2021-------------------------------------------------------
%-----------------------------------------------------------------------------------------------

%--------------------------------------------------------------------------------------------------------------------------
%--1. Inicializo el sistema -----------------------------------------------------------------------------------------------
%--------------------------------------------------------------------------------------------------------------------------

close all   % Cierra ventanas, archivos o procesos que se esten ejecutando
clear all   % borra variables del espacio de trabajo
clc         % Limpia la ventana de comando

% Condiciones iniciales para la pelota
x = 320;					% Coordenada inicial en el eje x de la pelota
y = 200;					% Coordenada inicial en el eje y de la pelota
vx = -10;					% Componente en x de la velocidad inicial de la pelota
vy = -20;					% Componente en y de la velocidad inicial de la pelota
dt = 0.5;					% Diferencial de tiempo
tetha = pi/3;					% Variable donde se guardará la dirección vector velocidad

% Variables asociadas a la interfaz del juego
jugador1 = 0;					% Variable donde se almacenan los puntos anotados por el jugador 1
jugador2 = 0;					% Variable donde se almacenan los puntos anotados por el jugador 2
table = imread("table.jpg");			% Variable donde se almacena la imagen del fondo
table = imresize(table, 2);			% Se redimensiona la imagen para coincidir con la resolución de la camara
e = 0;						% Sirve para contar errores
n = 0;						% Sirve para contar el número de frames capturados
%--------------------------------------------------------------------------------------------------------------------------
%--2. Habilitación de la Camara Web----------------------------------------------------------------------------------------
%--------------------------------------------------------------------------------------------------------------------------

cam = webcam(1);				% Variable asociada a la camara a usar mediante la función webcam
imshow('table.jpg')				% Se muestra la imagen de fondo

% Mediante el ciclo se garantiza que el juego continue
while jugador1 < 3 && jugador2 <3			% como condición de salida del ciclo alguien debe anotar 3 goles
   
%--------------------------------------------------------------------------------------------------------------------------
%--3. Captura--------------------------------------------------------------------------------------------------------------
%--------------------------------------------------------------------------------------------------------------------------
    
    frame = snapshot(cam);				% Captura una imagen
    n = n+1;						% Una vez capturada incrementa el contador
    frame = flip(frame, 2);				% se voltea por el eje vertical

%--------------------------------------------------------------------------------------------------------------------------
%--4. Preprocesado---------------------------------------------------------------------------------------------------------
%--------------------------------------------------------------------------------------------------------------------------
    
    solo_rojo = frame(:,:,1)-rgb2gray(frame);		% De este modo se extrae regiones donde el rojo sea predominante
    solo_rojo = medfilt2(solo_rojo, [3 3]);		% Con el filtro se elimina cierto nivel de ruido
    solo_rojo = imbinarize(solo_rojo, 0.2);		% Se escoje un nivel de binarizado que permita separar los punteros
    solo_rojo = bwareaopen(solo_rojo, 150);		% Con esta función eliminamos objetos con area menor a 150 pixeles
    solo_rojo = imclose(solo_rojo, strel('disk', 23));	% Se cierra la imagen con el objetivo de rellenar huecos.

%--------------------------------------------------------------------------------------------------------------------------
%--5. Segmentación---------------------------------------------------------------------------------------------------------
%--------------------------------------------------------------------------------------------------------------------------

    L= bwlabel(solo_rojo);  					% La imagen se etiqueta por regiones
    
    if  max(max(L))~=2						% Si se encuentra una cantidad de elementos diferentes a 2
        e=e+1;							% Cuentelo como un error
    end
    while max(max(L)) <2        				% Se debe garantizar que minimo se encuentren dos regiones
        frame = snapshot(cam);					% De lo contrario se ejecuta nuevamente el preprocesado
        n = n+1;						% y se contabiliza el nuevo frame
        frame = flip(frame, 2);
        solo_rojo = frame(:,:,1)-rgb2gray(frame);
        solo_rojo = medfilt2(solo_rojo, [3 3]);
        solo_rojo = imbinarize(solo_rojo, 0.2);
        solo_rojo = bwareaopen(solo_rojo, 150);
        solo_rojo = imclose(solo_rojo, strel('disk', 23));
         L= bwlabel(solo_rojo);                              % Se asignan las etiquetas una vez mas
           e=e+1;					     % Entrar al bucle ya implica error y hay que contabilizarlo
    
    end

%--------------------------------------------------------------------------------------------------------------------------
%--6. Obtención del Centroide----------------------------------------------------------------------------------------------
%---------------------------------------------------------------------------------------------------------------------------

    Disco1 = L*0;						% Variable donde se guardará la imagen del Disco 1
    Disco2 = L*0;						% Variable donde se guardará la imagen del Disco 2
    
    Disco1(L==1) = 1;						% A partir de la segmentación se guarda el Disco 1
    Disco2(L==2) = 1;						% A partir de la segmentación se guarda el Disco 2	
    
    centro1 = regionprops(Disco1, 'Centroid');			% Se obtienen las coordenadas del centroide del Disco 1
    centro2 = regionprops(Disco2, 'Centroid');			% Se obtienen las coordenadas del centroide del Disco 2
    
    
%--------------------------------------------------------------------------------------------------------------------------
%--7. Gráficas y física del juego------------------------------------------------------------------------------------------
%---------------------------------------------------------------------------------------------------------------------------    
    % Las siguientes dos lineas grafican los Discos en pantalla en la posición que indican los centroides
    Disco1 = rectangle('Position',[centro1.Centroid(1), centro1.Centroid(2), 40, 40],'Curvature', [1 1], 'FaceColor', 'r');
    Disco2 = rectangle('Position',[centro2.Centroid(1), centro2.Centroid(2), 40, 40],'Curvature', [1 1], 'FaceColor', 'r');
    
    % La siguiente linea de codigo grafica la pelota en la coordenada de inicio
    bolita = rectangle('Position', [x, y, 30, 30], 'Curvature', [1 1], 'FaceColor', 'g');
    
%---- Actualización de la posición de la pelota----------------------------------------------------------------------------
    x = x+vx*dt;								% Actualización en x
    y = y+vy*dt;								% Actualización en y
    
%---- Mecánica de las anotaciones------------------------------------------------------------------------------------------
    
    if x>625					% Si el centro de la pelota sobre pasa los pixeles de la columna 625:
        jugador1 = jugador1+1;			% El jugador 1 marca un punto
    end
    
     if x<16					% Si el centro de la pelota esta antes de los pixeles de la colmuna 16 
        jugador2 = jugador2+1;			% el jugador 2 marca un punto
    end
    
    if x<16 || x>625								% siempre que se presenten anotaciones
         x = 320;								% Se restablece la posición de la pelota
         y = 200;								% tal como en el inicio
        Goal = text(260, 180, 'GOAL');						% Se imprime un mensaje de GOAL
        set(Goal, 'Fontsize', 40, 'color', 'blue', 'FontName', 'Chiller')	% Con estilo 
        pause(1)								% Se mantiene por un segundo
        set(Goal, 'Visible', 'off');						% Y luego el mensaje desaparece
    end
    
    
%---- Mostrar marcador actual----------------------------------------------------------------------------------------------
    marcador = [num2str(jugador1),'                                    ', num2str(jugador2)];  % se guarda el marcador
    marcador = text(100, 20, marcador);								% Se imprime
    set(marcador, 'Fontsize', 30, 'color', 'green', 'FontName', 'Chiller')			% Se le modifica el estilo
    
%---- Rebote de la pelota en los costados----------------------------------------------------------------------------------
    
    if y > 300 				% Si la pelota esta por debajo de la fila 300
        vy = -vy;			% La componente de velocidad en y cambia de signo
        
    end
    
    if y < 35				% Si la pelota esta por encima de la fila 35 
        vy = -vy;			% La componente de velocidad en y cambia de signo igualmente
       
    end
    
    
 %---- Colisión entre pelota y Disco---------------------------------------------------------------------------------------
   
    R = 20+15;					% R es la suma del radio de la pelota y el Disco
    
    for i = 1:2					% Se trabaja primero con el Disco 1 y luego con el 2
        
        if i == 1				% Si se trata del Disco 1
            disx = centro1.Centroid(1)-x;	% se haya el componente de distancia en x
            disy = centro1.Centroid(2)-y;	% y luego el componente de distancia en y
        else                                % de lo contrario
            disx = centro2.Centroid(1)-x;	% lo mismo
            disy = centro2.Centroid(2)-y;	% pero ya sabemos que se trata de la pelota 2
        end

        distancia = sqrt((disx)^2+(disy)^2);		% Se haya la distancia usando el teorema de pitagoras
        
        if distancia <= R				% Si esta resulta inferior a R
            
            magnitud_velocidad = sqrt(vx^2+vy^2);	% Se calcula la magnitud de la velocidad
            
            if disy <0                              % Si la pelota golpio por abajo
                tetha = atan(disx/disy);            % el angulo de impacto se calcula de esta manera
                vx = magnitud_velocidad*sin(tetha); % y a partir de él el nuevo componente de velocidad en x
                vy = magnitud_velocidad*cos(tetha);	% y el nuevo componente de velocidad en y
            else                                    % De lo contrario, golpio por encima
                tetha = atan(disy/disx);            % entonces, el angulo de impacto se calcula así
                vx = magnitud_velocidad*cos(tetha);	% y el nuevo componen de velocidad en x así
                vy = magnitud_velocidad*sin(tetha);	% con la respectiva componente de velocidad en y así
            end
            
        end
 
 
    end
    
%---- Desaparecer los objetos de la pantalla-------------------------------------------------------------------------------
   pause(0.1)  					% Despues de un segundo
   set(bolita, 'Visible', 'off')		% Se desaparece la pelota
  set(marcador, 'Visible', 'off')		% Se desaparece el marcador
  set(Disco1, 'Visible', 'off')			% Se desaparece el Disco 1
   set(Disco2, 'Visible', 'off')		% Se desaparece el Disco 2

end

clear cam;					% Al salir del ciclo se desactiva la camara

if jugador1 > jugador2										% Si el jugador 1 marco más
    set(text(50, 150, 'El Jugador 1 Gana'), 'Fontsize', 50, 'color', 'blue', 'FontName', 'Chiller') % se indica que él gana
else												    % de lo contrario
    set(text(50, 150, 'El Jugador 2 Gana'), 'Fontsize', 50, 'color', 'blue', 'FontName', 'Chiller') % gano el 2	
end

%--------------------------------------------------------------------------------------------------------------------------
%---------------------------  FIN DEL PROGRAMA ----------------------------------------------------------------------------
%--------------------------------------------------------------------------------------------------------------------------
