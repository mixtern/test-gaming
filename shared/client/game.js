var game = {},
    stats = {floor:0,level:0,question:0,answers:{length:0}},
    loading=false;
/*************
* УПРАВЛЕНИЕ *
*************/
//Объект, хранящий все нажатые клавиши как свойства.
//Если клавиша не нажата свойства с таким значением не будет.
var keys = {};
//Событие нажатия на клавишу.
window.addEventListener("keydown", function(e){
if (!(e.keyCode in keys)) {
            keys[e.keyCode]=true;
        }
    }, true);
//Событие отпускания клавиши.
window.addEventListener('keyup',function(e){
if (e.keyCode in keys) {
delete keys[e.keyCode];
        }
    },true);
//Функция для проверки состояния клавиши с кодом n.
//Возвращает true, если клавиша нажата, и false если нет.
function keyPressed(n){
return (n in keys);
}

//генератор случайных чисел
/*function getRnd(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}*/
//Последовательность чисел от start до end
function range(start,end) {
  if (start > end){
    [start,end]=[end,start];
  }
  var res = [];
  for(var x = start;x<=end;x++){
    res.push(x);
  }
  return res;
}
//Проверить, есть ли блок на координатах (x;y)
function isBlock(x,y) {
  return !(isNaN(main.blocks[x][y]) || main.blocks[x][y]==='0');
}
//Вернуть игрока в исходное состояние
function reset(){
  player.x=-1;
  player.y=-1;
  main.doors=[];
}
//Переменная для расчёта физики
var physics = {
  //Все константы, использвуемые в расчёте физики
  const:{
    g:10,
    jumpForce:6,
    maxSpeed:5,
    boost:1
  },
  //Проверка на коллизию со стенами
  facingWall:function () {
    //координаты игрока
    var x = player.x;
    var y = player.y;
    //Размеры спрайта игрока
    var height = player.sprite.naturalHeight;
    var width = player.sprite.naturalWidth;
    var res = false;
    var xx = 0;
    //если игрок идёт направо
    if (player.speed > 0){
      xx = Math.floor((x+width+player.speed)/25);
      range(Math.floor((y+2)/25),Math.floor((y+height)/25)).forEach(function (yy){
        if (isBlock(xx,yy))res = true;
      })}
    //Если игрок идёт налево
    else if(player.speed < 0){
      xx = Math.floor((x+player.speed)/25);
      range(Math.floor((y+2)/25),Math.floor((y+height)/25)).forEach(function (yy){
        if (isBlock(xx,yy)) res = true;
      })
    }
    return res;
  },
  //Просчёт всей физики
  calc:function(){
    //Прыжки
    physics.jump();
    //Гравитация
    physics.gravity();
    //Передвижение
    physics.movement();
    //Обработчик вхождения в дверь
    var res = physics.doorCollision();
    if(res && !loading){
      answer(res);
      stats.question++;      
    }
  },
  //Гравитация
  gravity:function () {
    //Ускоряем падение
    player.g-=physics.const.g/constant.fps;
    //Сверяемся что игрок не стоит на земеле
    var bx1 = Math.floor((player.x+1)/25);
    var bx2 = Math.floor((player.x + player.sprite.naturalWidth-1)/25);
    var by1 = Math.floor((player.y + player.sprite.naturalHeight-player.g+1)/25);
    var by2 = Math.floor((player.y - player.g+1)/25);
    //Если стоит
    if (isBlock(bx1,by1)||isBlock(bx2,by1)){
      //Устанавливаем ускорение игрока на 0
      player.g = 0;
      player.inAir=false;
    }
    //Если находится в воздухе
    else {
      //Если "ударяется головой" о блок
      if(isBlock(bx1,by2)||isBlock(bx2,by2)){
        player.g=0;
      }
      //Изменение положения игрока
      player.y -= player.g;
      player.inAir=true;
    }
  },
  //Передвижение
  movement:function () {
    //По нажатым клавишам получаем направление
    var dir = 0;
    if (keyPressed(37)) dir-=1;
    if (keyPressed(39)) dir+=1;
    if (dir === 0) {
      //Замедление при бездействии
      player.speed-=Math.sign(player.speed)*physics.const.boost;
    }
    //Ускорение при передвижени
    else{
      player.speed += physics.const.boost * dir;
      //Просчёт ограничения скорости
      player.speed = Math.abs(player.speed) > physics.const.maxSpeed ? Math.sign(player.speed) * physics.const.maxSpeed : player.speed;
    }
    //Проверка на столкновение со стеной
    if(physics.facingWall()){
      player.speed = 0;
    }
    //Изменение положения игрока
    else player.x += player.speed;
  },
  //Механика прыжков
  jump:function () {
    //Если игрок нажал на пробел или стрелку вверх
    if((keyPressed(32)||keyPressed(38))&&!player.inAir){
      //добавить вертикальное ускорение
      player.g=physics.const.jumpForce;
    }
  },
  //Проверка на вхождение в дверь
  doorCollision:function () {
    var res=false;
    //для каждой двери
    main.doors.forEach(function (door,n) {
      //Если зашёл в дверь
      if((player.x + player.sprite.naturalWidth>door.x*25)&& (player.x < door.x*25 + main.doorTextures[n].naturalWidth)&& (player.y + player.sprite.naturalHeight > door.y*25)&& (player.y < door.y*25 + main.doorTextures[n].naturalHeight)){
        //Вернуть её номер
        res = n+1;
      }
    });
    return res;
  }
};
var temp,main,bgr,player,gui;
//глобальные псевдо-константы
constant = {
  //Функциональность изменения колличества кадров не реализованна
  fps:60
};
//создание главного объекта
window.addEventListener("load",function(){
  //Закадровый холст
  temp = document.getElementById("hidden");
  //Свойство drawn показывает, был ли холст прорисован после изменений
  //Функция draw() выполняет все действия для прорисовки
  //Фон
  bgr = {
    //Холст
    canvas:document.getElementById("background"),
    //Его интерфейс
    ctx:document.getElementById("background").getContext('2d'),
    //Изображение для прорисовки на холсте
    img:new Image(),
    drawn:false,
    draw:function(){
      bgr.drawn=true;
      //Очистка холста
      bgr.ctx.clearRect(0,0,800,600);
      //Перерисовка с закадрового
      bgr.ctx.drawImage(bgr.img,0,0);
    }
  };
  //Блоки и двери
  main = {
    //Повторяющиеся свойства имеют аналогичное с bgr значение
    canvas:document.getElementById("main"),
    ctx:document.getElementById("main").getContext('2d'),
    //Двумерный массив блоков, изначально пуст
    blocks:[],
    //Массив с коордиантами дверей
    doors:new Array(4).fill({}),
    //размеры уровня
    height:24,
    width:32,
    //Массив с текстурами блоков
    textures:[],
    //Массив с текстурами дверей
    doorTextures:[],
    drawn:false,
    draw:function() {
      main.drawn=true;
      temp.ctx.clearRect(0, 0, 800, 600);
      //Прорисовка блоков
      for (x = 0; x < main.width; x++) {
        for (y = 0; y < main.height; y++) {
          if(isBlock(x,y)){
            temp.ctx.drawImage(main.textures[main.blocks[x][y]-1],x*25,y*25);
           }
           else {
            if (main.blocks[x][y].toLowerCase() ==='p' && !((~-player.x || ~-player.y)>0)){
              player.x = x*25-player.sprite.naturalWidth+24;
              player.y = y*25-player.sprite.naturalHeight+24;
            }
            if (main.blocks[x][y][0] === 'd'){
              main.doors[main.blocks[x][y][1]-1]={x:x,y:y};
            }
          }
        }
      }
      //Прорисовка дверей
      main.drawDoors();
      main.ctx.clearRect(0, 0, 800, 600);
      main.ctx.drawImage(temp, 0, 0)
    },
    //Функция прорисовки дверей
    drawDoors:function(){
      for(var i = 0;i<4;i++){
        temp.ctx.drawImage(main.doorTextures[i],main.doors[i].x*25,main.doors[i].y*25+25-main.doorTextures[i].naturalHeight);
      }
    }
  };
  //Персонаж
  player = {
    //Повторяющиеся свойства имеют аналогичное с bgr значение
    //Горизонтальная скорость
    speed:0,
    canvas:document.getElementById("player"),
    ctx:document.getElementById("player").getContext('2d'),
    //Координаты
    x:-1,
    y:-1,
    //Вертикальное ускорение
    g:0,
    //Спрайт игрока
    sprite:new Image(),
    draw:function(){
      temp.ctx.clearRect(0, 0, 800, 600);
      temp.ctx.drawImage(player.sprite,player.x,player.y);
      player.ctx.clearRect(0, 0, 800, 600);
      player.ctx.drawImage(temp, 0, 0)
    }
  };
  //Пользовательский интерфейс
  gui = {
    //Повторяющиеся свойства имеют аналогичное с bgr значение
    canvas:document.getElementById("gui"),
    ctx:document.getElementById("gui").getContext('2d'),
    drawn:false,
    draw:function(){
      gui.drawn=true;
      var room = currentFloor.rooms[stats.level];
      temp.ctx.clearRect(0, 0, 800, 600);
      temp.ctx.font = '20px '+ room.font;
      temp.ctx.fillStyle=room.color;
      temp.ctx.fillText('ВОПРОС '+ (stats.question+1) +': '+testList.questions[stats.question],room.coordinates.question.x,room.coordinates.question.y,750);
      for(var i=0;i<4;i++){
        var x = room.coordinates.answers[i].x,
            y = room.coordinates.answers[i].y;
        temp.ctx.fillText((i+1).toString()+".   "+testList.answers[stats.question][i],x,y,400);
        gui.ctx.clearRect(0, 0, 800, 600);
        gui.ctx.drawImage(temp, 0, 0);
      }
    }
  };
  //Подключение интерфейса закадрового холста
  temp.ctx = temp.getContext('2d');
  //Глобальный объект game для управления состоянием игры
  window.game = {
    //Функция запуска игрового цикла
    start:function(){
      //Скрываем меню подключения
      document.getElementById('connect').classList.add('hide');
      //Отображаем игровой интерфейс
      document.getElementById('game').classList.remove('hide');
      //Запускаем игровой цикл *constant.fps* раз в секунду
      //Сохраняем идентификатор интервала в переменную game.interval
      game.interval = setInterval(game.reDraw,1000/constant.fps)
    },
    //Функция приостановки игрового цикла
    stop:function(){
      //Останавливаем цикл с помощью ранее сохранённого идентификатора
      clearInterval(game.interval);
      //Удаляем идентификатор по ненадобности
      game.interval = null;
    },
    //Тело игрового цикла
    reDraw:function(){
      //Перерисовка фона
      if (!bgr.drawn) bgr.draw();
      //Перерисовка блоков
      if(!main.drawn) main.draw();
      //Прорисовка спрайта игрока
      player.draw();
      //Пересчёт физики
      physics.calc();
      //Прорисовка пользовательского интерфейса
      if(!gui.drawn)gui.draw();
  }};
});
//Получаем карты через AJAX-запрос
function getMaps() {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function(){
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      window.map = JSON.parse(httpRequest.responseText);
      loadFloor(0);
    }
  };
  httpRequest.open('GET','http://'+ip+':'+ port +'/map/index.json', true);
  httpRequest.send(null);
}
//Загрузка этажа
function loadFloor(n) {
  window.floorName = window.map.floors[n];
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function(){
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      window.currentFloor = JSON.parse(httpRequest.responseText);
      getSprites();
    }
  };
  httpRequest.open('GET',root +'/map/'+floorName + '/index.json', true);
  httpRequest.send(null);
}
//Переход на следующий этаж
function nextFloor() {
  stats.floor++;
  stats.level = 0;
  loadFloor(stats.floor % map.floors.length);
}
//Получение спрайтов
function getSprites() {
  window.sprites=new Array(currentFloor.textures.list.length);
  currentFloor.textures.list.forEach(getSprite);
  window.spritesLeft = currentFloor.textures.list.length;
}
//Получение отдельного спрайта
function getSprite(item,index) {
  window.sprites[index]=new Image();
  sprites[index].addEventListener('load', function () {
    spritesLeft--;
    if(!spritesLeft){
      setTimeout(function () {
        putSprites();
        getRooms();
      },1000);
    }
  });
  sprites[index].src = root +'/map/'+window.floorName + '/textures/'+item;
}
//Получение комнат
function getRooms() {
  currentFloor.rooms = new Array(currentFloor.roomCount);
  window.roomsLeft = currentFloor.roomCount;
  for(var i = 0; i < currentFloor.roomCount;i++){
    getRoom(i);
  }
}
//Установить комнату n как текущую
function setRoom(n) {
  main.blocks = currentFloor.rooms[n].map;
  main.width = 32;
  main.height = 24;
  mapBlocks();
  main.drawn=false;
  gui.drawn=false;
}
//Переключение комнаты
function nextRoom() {
  game.stop();
  reset();
  stats.level++;
  if(stats.level>=currentFloor.roomCount){
    nextFloor();
  }
  else{
    setRoom(stats.level);
    game.start();
  }
  loading=false;
}
//Установка текстур блоков
function mapBlocks() {
  for(var i = 0;i < currentFloor.textures.blocks.length;i++){
    main.textures[i] = sprites[currentFloor.textures.blocks[i]];
  }
  for(var i = 0;i < currentFloor.textures.doors.length;i++){
    main.doorTextures[i] = sprites[currentFloor.textures.doors[i]];
  }
}
//Получение определённой комнаты
function getRoom(n) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function(){
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      var str = httpRequest.responseText;
      currentFloor.rooms[n] = JSON.parse(str);
      roomsLeft--;
      if (!roomsLeft){
        setRoom(0);
        bgr.drawn=false;
        main.drawn=false;
        game.start();
      }
    }
  };
  httpRequest.open('GET',root +'/map/'+floorName + '/rooms/'+ (n+1) +'.json', true);
  httpRequest.send(null);
}
//Установка текстур персонажа и фона
function putSprites() {
  bgr.img = sprites[currentFloor.textures.background];
  player.sprite = sprites[currentFloor.textures.player];
}
//получаем набор тестов
function getTests() {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function(){
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
      window.testList = JSON.parse(httpRequest.responseText);
    }
  };
  httpRequest.open('GET',root +'/tst/index.json', true);
  httpRequest.send(null);
}
//ответ на текущий вопрос
function answer(number) {
  loading = true;
  stats.answers[stats.answers.length++]=number;
  if (stats.question==testList.length-1){
    game.stop();
    sendAnswers();
  }
  else setTimeout(nextRoom(),1000);
}
//Отправляем ответы на сервер
function sendAnswers(){
  stats.answers.name = global.username;
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange=function(){
    if (httpRequest.readyState == 4){
      document.getElementById("game").classList.add("hide");
      document.getElementById("done").classList.remove("hide");
      document.getElementById("status").innerHTML="Правильных ответов: "+httpRequest.responseText +' из ' +stats.answers.length;
    }
  }
  httpRequest.open('POST',root +'/answer', true);
  httpRequest.send(JSON.stringify(stats.answers));
}
