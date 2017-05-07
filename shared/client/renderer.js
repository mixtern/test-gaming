//Функция для подключения. Заготовка на будущее
function connect(ip,port){

}
//Объект для работы с списком серверов
var favourite ={
  //Массив со всеми серверами
  list:[],
  //Функция для считывания списка из файла config/favourites.json и прорисовки списка
  refresh:function(){
    //Пордключаем модули path и fs, подробнее на:
    //https://nodejs.org/dist/latest-v6.x/docs/api/path.html
    //https://nodejs.org/dist/latest-v6.x/docs/api/fs.html
    var path = require('path');
    var fs = require('fs');
    //Чтение конфига из файла
    favourite.list = JSON.parse(fs.readFileSync(path.join(global.__dirname,'config/','favourites.json')));
    //Создание таблицы на основе данных
    var out = '<tr><th>Имя</th><th>IP</th><th>Порт</th><th>Подключиться</th></tr>';
    favourite.list.forEach(function(fav,n){
      out += '<tr><td><td><button onclick="favourite.remove(\''+n+'\')">X</button></td><td>'+fav.name+'</td><td>'+ fav.ip +'</td><td>'+ fav.port +'</td><td><button onclick="connect(\''+fav.ip +'\',\''+ fav.port+'\')">Подключится</button></td>';
    });
    //Вывод таблицы на экран
    document.getElementById("tlist").innerHTML = out;
  },
  //Добавить сервер в список
  add:function(){
    var fs = require('fs');
    var path = require('path');
    //Получить данные из формы
    var name = document.getElementById("name").value,
      ip = document.getElementById("ip").value,
      port = document.getElementById("port").value;
      document.getElementById("name").value = "";
      document.getElementById("ip").value = "";
      document.getElementById("port").value = "";
    //Добавить сервер в массив
    favourite.list.push({"name":name,"port":port,"ip":ip});
    //Записать изменения в файл
    fs.writeFileSync(path.join( global.__dirname,'config/','favourites.json'),JSON.stringify(favourite.list));
    //Обновить вид
    favourite.refresh();
  },
  //Удаление сервера из списка
  remove:function(n){
    //Удаление элемента
    favourite.list.splice(n,1);
    var path = require('path');
    var fs = require('fs');
    fs.writeFileSync(path.join( global.__dirname,'config/','favourites.json'),JSON.stringify(favourite.list));
    favourite.refresh();
  }
};