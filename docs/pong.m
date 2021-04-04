close all
clear all
clc

x = 320;
y = 200;
vx = -10;
vy = -20;
dt = 0.5;
tetha = pi/3;

jugador1 = 0;
jugador2 = 0;
table = imread("table.jpg");
table = imresize(table, 2);
img_Discos = [0 0];
cam = webcam(1);
imshow('table.jpg')

while jugador1 < 3 && jugador2 <3
   
    frame = snapshot(cam);
    frame = flip(frame, 2);
    solo_rojo = frame(:,:,1)-rgb2gray(frame);
    solo_rojo = medfilt2(solo_rojo, [3 3]);
    solo_rojo = imbinarize(solo_rojo, 0.2);
    solo_rojo = bwareaopen(solo_rojo, 150);
    solo_rojo = imclose(solo_rojo, strel('disk', 23));

    L= bwlabel(solo_rojo);
    while max(max(L)) <2
        frame = snapshot(cam);
        frame = flip(frame, 2);
        solo_rojo = frame(:,:,1)-rgb2gray(frame);
        solo_rojo = medfilt2(solo_rojo, [3 3]);
        solo_rojo = imbinarize(solo_rojo, 0.2);
        solo_rojo = bwareaopen(solo_rojo, 150);
        solo_rojo = imclose(solo_rojo, strel('disk', 23));

         L= bwlabel(solo_rojo);
    end
    Areas =  regionprops(L, 'Area');
    j = 1;
    temp = L*0;
    Discos = zeros(480, 640, 2);
    
    for i = 1:max(max(L))
        if j>2
               break;
        end
    
            temp(L==i) = 1;
            Discos(:,:,j) = temp;
            temp = L*0;
            j = j+1;
           
    
    end
    
    centro1 = regionprops(Discos(:,:,1), 'Centroid');
    centro2 = regionprops(Discos(:,:,2), 'Centroid');
    
    Disco1 = rectangle('Position',[centro1.Centroid(1), centro1.Centroid(2), 40, 40],'Curvature', [1 1], 'FaceColor', 'r');
    Disco2 = rectangle('Position',[centro2.Centroid(1), centro2.Centroid(2), 40, 40],'Curvature', [1 1], 'FaceColor', 'r');
    
    bolita = rectangle('Position', [x, y, 30, 30], 'Curvature', [1 1], 'FaceColor', 'g');
    
     
    x = x+vx*dt;
    y = y+vy*dt;
    
    if x>625
        jugador1 = jugador1+1;
    end
    
     if x<16
        jugador2 = jugador2+2;
    end
    
    if x<16 || x>625
         x = 320;
         y = 200;
        Goal = text(260, 180, 'GOAL');
        set(Goal, 'Fontsize', 40, 'color', 'blue', 'FontName', 'Chiller')
        pause(1)
        set(Goal, 'Visible', 'off');
    end
    
    
    marcador = [num2str(jugador1),'                                    ', num2str(jugador2)];
    marcador = text(100, 20, marcador);
    set(marcador, 'Fontsize', 30, 'color', 'green', 'FontName', 'Chiller')
    
    if y > 300
        vy = -vy;
        
    end
    
    if y < 35
        vy = -vy;
       
    end
    
    
    
    R = 20+15;
    
    for i = 1:2
        
        if i == 1
            disx = centro1.Centroid(1)-x;
            disy = centro1.Centroid(2)-y;
        else
            disx = centro2.Centroid(1)-x;
            disy = centro2.Centroid(2)-y;
        end
        distancia = sqrt((disx)^2+(disy)^2);
        
        if distancia <= R
            
            magnitud_velocidad = sqrt(vx^2+vy^2);
            
            if disy <0
                tetha = atan(disx/disy);
                vx = magnitud_velocidad*sin(tetha);
                vy = magnitud_velocidad*cos(tetha);
            else
                tetha = atan(disy/disx);
                vx = magnitud_velocidad*cos(tetha);
                vy = magnitud_velocidad*sin(tetha);
            end
            
        end
 
 
    end
    

   pause(0.1)  
   set(bolita, 'Visible', 'off')
  set(marcador, 'Visible', 'off')
  set(Disco1, 'Visible', 'off')
   set(Disco2, 'Visible', 'off')

end

clear cam;

if jugador1 > jugador2
    set(text(50, 150, 'El Jugador 1 Gana'), 'Fontsize', 50, 'color', 'blue', 'FontName', 'Chiller')
else
    set(text(50, 150, 'El Jugador 2 Gana'), 'Fontsize', 50, 'color', 'blue', 'FontName', 'Chiller')
end
