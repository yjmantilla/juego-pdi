# Video

https://youtu.be/0RKpVqaxXiw

# Ejecución

## Online

La forma más fácil es ingresando directamente en la página del juego:
https://yjmantilla.github.io/juego-pdi/campong.html


## Localmente

Para ejecutar se puede montar la carpeta en un servidor. 

Una forma fácil de hacer esto es con Web Server for Chrome:
https://chrome.google.com/webstore/detail/web-server-for-chrome/ofhbbkphhbklhfoeikjpcbhemlocgigb?hl=en

Para instrucciones más detalladas ver https://yjmantilla.github.io/juego-pdi/

## Configuración del reconocimiento

Lo ideal es utilizar el fondo "morph" y configurar los parámetros "low_th" y "blur_ksize" para que el objeto se reconozca bien.
Para instrucciones más detalladas ver https://yjmantilla.github.io/juego-pdi/

## Tiempo de carga

Al inicio tarda algo en cargar ya que él codigo en bruto de opencv pesa 7mb.

## Sobre el script camselect.js

El script camselect.js no es propiamente de nosotros por lo que no se comentó, se utiliza para el selector de cámara.
Este código fue extraído del ejemplo https://webrtc.github.io/samples/src/content/devices/input-output/ .
