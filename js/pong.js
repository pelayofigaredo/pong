window.onload = function () {
    //Se establece referencia al canvas
    gc = this.document.getElementById("gameCanvas");
    context = gc.getContext("2d");

    //Se añaden los eventos de teclado
    this.document.addEventListener('keydown', this.keyPressed);
    this.document.addEventListener('keyup', this.keyReleased);

    

    //Se indica el intervalo con el que se llama a la función tick, que sera responsable
    //de mover los elementos en el canvas.
    this.setInterval(tick,1000/20); 

    //La funcion timer se llama una vez por segundo
    this.setInterval(Timer,1000); 

    $(":text").change(UpdateNames);

    $("#pause").click(TogglePause);
    $("#pause").hide();
    $("#startGame").click(StartGame);

    //Asignamos el evento de la configuración y lo ocultamos a priori
    $("#config").click(ToggleConfig);
    $("#configSection").hide();

    //Eventos para el cambio de colores
    $("#player1Color").change(function(){
        player1Color = $( "#player1Color" ).val();
        $("#scorep1").css("color",player1Color);
    });
    $("#player2Color").change(function(){
        player2Color = $( "#player2Color" ).val();
        $("#scorep2").css("color",player2Color);
    });
    $("#ballColor").change(function(){
        ballColor = $( "#ballColor" ).val();
    });

    //Canvas a estado incial pre juego
    context.fillStyle="black";
    context.fillRect(0,0,gc.width,gc.height);
    context.font = "48px Arial";
    context.fillStyle="white";
    context.fillText("Pong de Pelayo!", gc.width/2 - 190, gc.height/2 - 24);

    player1Color = $( "#player1Color" ).val();
    $("#scorep1").css("color",player1Color);
    player2Color = $( "#player2Color" ).val();
    $("#scorep2").css("color",player2Color);

}

//Array asociativo que sireve de buffer para las teclas pulsadas
let keysPressed = {};

//Variables de los jugadores
let collisionMargin = 3 //Se añade al tamaño de las palas para el calculo de las colisiones
let thicknesPlayer = 15;//Grosor de la pala
let sizePlayer = 80;//"Altura" de la pala
let speedPlayer = 8;//Velocidad en pixeles por frame a la que se mueve la pala
let player1Direction = 0;//Direccion en la que se mueve la pala del jugador 1
let player2Direction = 0;//Direccion en la que se mueve la pala del jugador 2
let player1Pos = 200-sizePlayer/2;//Posicion de la pala del jugador 1
let player2Pos = 200-sizePlayer/2;//Posicion de la pala del jugador 2
let player1Color = "orange";//Color de la pala del jugador 1
let player2Color = "purple";//Color de la pala del jugador 2
let score1 = 0;//Puntuacion jugador 1
let score2 = 0;//Puntuacion jugador 2
let player1Name = "Jugador 1";//Nombre del jugador 1
let player2Name = "Jugador 2";//Nombre del jugador 2
//Variables de la pelota
let initialSpeedBall = 5;//Velocidad inicial de la pelota
let speedBall = 5;//Velocidad actual de la pelota
let radiusBall = 10;//Radio de la pelota
let ballColor = "green";//Color de la pelota
let ballx = 400;//Posicion x de la pelota
let bally = 200;//Posicion y de la pelota
let ballxDirection = 1;//Direccion x de la pelota
let ballyDirection = - 1;//Direccion y de la pelota

//Distancia a la que se encuentra la linea de gol de los bordes del canvas 
let goalDistance = 20;

//Estado de la seccion de configuracion
let isConfigOpen = false;

//Estado de la partida
let isPaused = true;
let isGameOver = true;

//Tiempo de la partida en segundos
let currentTime;
let gameTime = 180;

/** Inicializa los elementos de juego **/
function StartGame(){
    currentTime = gameTime;
    isGameOver = false;
    isPaused = false;
    ballx = 400;
    bally = 200;
    speedBall = initialSpeedBall;
    score1 = 0;
    score2 = 0;
    $("#scorep1").text(player1Name +":" + score1);
    $("#scorep2").text(player2Name +":" + score2);
    $("#time").text(currentTime);
    $("#startGame").text("Reiniciar");
    $("#pause").show();
}

/** Termina la partida y muestra el resultado en el canvas**/
function EndGame(){
    isPaused = true;
    isGameOver = true;
    context.font = "34px Arial";
    context.fillStyle="white";
    $("#startGame").text("Comenzar partida");
    $("#pause").hide(); 
    context.fillText("Fin de la partida!", gc.width/2 - 180, gc.height/2 - 50);
    if(score1 > score2)
    {
        context.fillStyle=player1Color;
        context.fillText(player1Name + " ha ganado", gc.width/2 - 180, gc.height/2 );
    }
    if(score1 < score2)
    {
        context.fillStyle=player2Color;
        context.fillText(player2Name + " ha ganado", gc.width/2 - 180, gc.height/2 );
    }
    if(score1 == score2)
    {
        context.fillText("empate", gc.width/2 - 180, gc.height/2);
    }
}



/** Loop principal del juego **/
function tick() {
    if(!isPaused){
        Input();
        //Moviemiento
        player1Pos +=  speedPlayer * player1Direction;
        player2Pos +=  speedPlayer * player2Direction;
        bally += speedBall * ballyDirection;
        ballx += speedBall * ballxDirection;
        Collisions();
    } 
    if(!isGameOver){
        Draw();
    }

}

/** Se llama una vez por segundo para medir la duraccion de la partida **/
function Timer(){
    if(!isPaused && !isGameOver){
        currentTime--;
        $("#time").text(currentTime);
        if(currentTime <= 0){//Si el tiempo llega a 0 la partida termina
            EndGame();
        }
    }

}

/** Gestiona las colisiones de la pelota y de las palas **/
function Collisions(){
        //Limitacion a los bordes del canvas
        if(player1Pos < 0){
            player1Pos = 0;
        }
        if(player1Pos > gc.height-sizePlayer){
            player1Pos = gc.height-sizePlayer;
        }
        if(player2Pos < 0){
            player2Pos = 0;
        }
        if(player2Pos > gc.height-sizePlayer){
            player2Pos = gc.height-sizePlayer;
        }
        if(bally > gc.height-radiusBall){
            bally = gc.height-radiusBall;
            ballyDirection = -1;
        }
        if(bally < 0 + radiusBall){
            bally = 0 + radiusBall;
            ballyDirection = 1;
        }
        //Zona Jugador 1
        if(ballxDirection == -1 ){
            if(ballx - radiusBall <=  thicknesPlayer + goalDistance){//Altura de la pala
                if((bally + radiusBall <= player1Pos + sizePlayer + collisionMargin) && ((bally -radiusBall) > player1Pos - collisionMargin))//Dentro de la pala
                {
                    ballxDirection = 1;
                    speedBall++;
                }
            }
            if(ballx - radiusBall <=  thicknesPlayer){//LLega a la linea de Gol
                ballxDirection = 1;
                score2++;
                Point();
            }
        }
    
      //Zona Jugador 2
        if(ballxDirection == 1 ){//Altura de la pala
            if(ballx + radiusBall >= gc.width - thicknesPlayer-goalDistance){
               if((bally + radiusBall < player2Pos + sizePlayer + collisionMargin) && ((bally -radiusBall) > player2Pos - collisionMargin))//Dentro de la pala
                {
                 ballxDirection = -1;
                 speedBall++;
               }
            }
            if(ballx + radiusBall >= gc.width - goalDistance){//LLega a la linea de Gol
                ballxDirection = -1;
                score1++;
                Point();
            }
        }
}

/** Redibuja los elemnetos en el canvas **/
function Draw(){
    context.clearRect(0, 0, gc.width,gc.height);
    //fondo
    context.fillStyle="black";
    context.fillRect(0,0,gc.width,gc.height);
     //Lineas de gol
    context.strokeStyle = "white";
    context.moveTo(goalDistance, 0);
    context.lineTo(goalDistance,gc.height);
    context.stroke();
    context.moveTo(gc.width - goalDistance, 0);
    context.lineTo(gc.width - goalDistance, gc.height);
    context.stroke();
    //jugador 1
    context.fillStyle=player1Color;
    context.fillRect(goalDistance,player1Pos,thicknesPlayer,sizePlayer);
    context.stroke();
    //jugador 2
    context.fillStyle=player2Color;
    context.fillRect(gc.width-goalDistance-thicknesPlayer,player2Pos,thicknesPlayer,sizePlayer);
    //pelota
    context.beginPath()
    context.arc(ballx, bally, radiusBall, 0, 2 * Math.PI, false);
    context.fillStyle = ballColor;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = "white";
    context.stroke();     
   
}

/** Actualiza las puntuaciones y resetea la posicion de la pelota **/
function Point(){
    $("#scorep1").text(player1Name +":" + score1);
    $("#scorep2").text(player2Name +":" + score2);
    speedBall = initialSpeedBall;
    ballx = gc.width/2 - radiusBall/2;
    bally = gc.height/2 - radiusBall/2;

}

/** Actualiza los nombres de los jugadores **/
function UpdateNames(){
    
    player1Name = $( "#player1name" ).val();
    player2Name = $( "#player2name" ).val();
    $("#scorep1").text(player1Name +":" + score1);
    $("#scorep2").text(player2Name +":" + score2);
    $("#scorep1").css("color",player1Color);
    $("#scorep2").css("color",player2Color);
}

/** Oculta o muestra la seccion de configuración**/
function ToggleConfig(){
    
    if(isConfigOpen){
        $("#configSection").hide();
    }
    else{
        if(!isPaused){
            TogglePause();
        }
        $("#configSection").show();
    }
    isConfigOpen = !isConfigOpen;
}

/** Pausa o reanuda la partida **/
function TogglePause(){
    if(isPaused){
        isPaused = false;
        $("#pause").text("Pausar");
    }
    else{
        isPaused = true;
        $("#pause").text("Reanudar");
    }
}

/** DETECTAR TECLAS PULSADAS **/
function keyPressed(event) {
    // Flechas de direccion (Jugador 2)
    if (event.keyCode == 38) {//flecha superior
        keysPressed['38'] = true;
        event.preventDefault();//Desactivamos el scroll vertical de la pagina
    }
    if (event.keyCode == 40 ) {//flecha inferior
        keysPressed['40'] = true;
        event.preventDefault();//Desactivamos el scroll vertical de la pagina
    }
    // W y S (Jugador 1)
    if (event.keyCode == 87) {//w
        keysPressed['87'] = true;
    }
    if (event.keyCode == 83 ) {//s
        keysPressed['83'] = true;
    }
    if(event.keyCode == 37 || event.keyCode == 39){
        event.preventDefault();//Desactivamos tambien el lateral
    }
}
/** DETECTAR TECLAS LEVANTADAS **/
function keyReleased(event) {
    // Flechas de direccion (Jugador 2)
    if (event.keyCode == 38) {//flecha superior
        delete keysPressed['38'];
    }
    if (event.keyCode == 40 ) {//flecha inferior
        delete keysPressed['40'];
    }
    // W y S (Jugador 1)
    if (event.keyCode == 87) {//w
        delete keysPressed['87'];
    }
    if (event.keyCode == 83 ) {//s
        delete keysPressed['83'];
    }
}

/** Actualiza la direccion de movimiento de las palas en funcion de las teclas que haya en el buffer **/
function Input(){
    player1Direction = 0;
    player2Direction = 0;
    if (keysPressed['38']) {//flecha superior
        player2Direction = -1;
    }
    if (keysPressed['40'] ) {//flecha inferior
        player2Direction = 1;
    }
    if(keysPressed['38'] && keysPressed['40']){
        player2Direction = 0;
    }
    // W y S (Jugador 1)
    if (keysPressed['87']) {//w
        player1Direction = -1;
    }
    if (keysPressed['83']) {//s
        player1Direction = 1;
    }
    if(keysPressed['83'] && keysPressed['87']){
        player1Direction = 0;
    }
}
