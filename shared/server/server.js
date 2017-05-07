//Массив всех полученных ответов
answers = [];
//Функция, отвечающая за расшифровку данных
function parsePost(req,res){
	//Переменная для сбора данных
    var body = '';
    //При получениеи данных добавить в переменную body
    req.on('data',function(data){
        body += data;
        if (body.length >1e6) {
            req.disconnect()
        }});
    //Событие окончания передачи данных
    req.on('end',function(){
        //Переводим json в объект
        var data = JSON.parse(body);
        //Добавляем ip адресс отправителя
        data.ip = req.connection.remoteAddress;
        //Считаем колличество правильных ответов
        var points = checkAnswer(data);
        //Добавляем к остальным результатам
        newAnswer(data,points);
        //Отправляем колличество балов
        res.end(points.toString()+'   ');
    });
}
//Функция проверки резльтата
function checkAnswer(data){
    //Переменная с колличеством баллов
    var res = 0;
    //Считываем правильные ответы из файла
    var fs = require('fs');
    var path = require('path')
    var content = fs.readFileSync(path.join(global.__dirname,'tests/',stats.test,'rightAnswers.json'));
        var rightAnswers = JSON.parse(content);
        //Проверяем ответы и добавляем по баллу за каждый
        for(var i=0;i<data.length;i++){
            if(data[i]==rightAnswers[i]) res++;
        }
    //Функция возвращает колличество баллов
    return res;
}
//Добавляем результат тестирования к другим
function newAnswer(data,points){
    //Добавляем заголовок таблицы
    var res = '<tr><th>Имя</th><th>IP-адрес</th><th>Результат</th></tr>';
    //Добавляем колличество баллов к храрактеристикам
    data.points = points;
    //Отправляем ответ к другим
    answers.push(data);
    //Перерисовываем таблицу
    answers.forEach(function(item){
        res+='<tr><td>'+ item.name +'</td><td>'+item.ip+'</td><td>'+item.points+'</td></tr>';
    })
    document.getElementById("stats").innerHTML=res;
}
//Функция для отправки файлов
function sendFile(path,res) {
    //Проверяем правильный ли путь
    var fs = require('fs');
    fs.exists(path,function (exist){
        //Если нет то отправляем 404
        if (!exist) {
            res.writeHead(404);
            res.end('Page not found');
            return;
        }
        //Если да то проверяем является ли он файлом
        fs.stat(path,function (err,stats){
            if (err) {
                throw err;
            }
            //Если является отправляем любой, кроме файла ответов
            if (stats.isFile()&&path.slice(path.lastIndexOf('/')) != 'rightAnswers.json'){
                var file = fs.createReadStream(path);
                file.pipe(res);
            }
            //Если не является то опять 404
            else {
                res.writeHead(404);
                res.end('Page not found');
            }
        })})}
//Переменная хранящая все характеристики:
//Имя, порт, выбор карты и набора тестов
var stats = {};
//Обработчик обращений к серверу
function handler(req,res){
    var path = require('path');
    //Обрабатываем в зависимости от адреса
    switch(req.url.slice(1,4)){
        //действие для карт
        case 'map':
            sendFile(path.join(global.__dirname,'maps/',stats.map,req.url.slice(4)),res);
            break;
        //для тестов
        case 'tst':
            sendFile(path.join(global.__dirname,'tests/',stats.test,req.url.slice(4)),res);
            break;
        //Для корня сайта(проверка на соответствие)
        case '':
            res.end('OK');
            break;
        //Для отправки ответов
		case 'ans':parsePost(req,res)
			break;
		}
}
//Запуск сервера
function startSrv(){
    //Подключение модуля http
    var http = require("http");
    //Создание объекта сервера
    var server = new http.createServer();
    //Подключение обработчика
    server.on("request",handler);
    //Запуск сервера
    server.listen((stats.port<1024||stats.port>=65535)?1337:stats.port, function(err) {
        if(err) throw err;
        //получение порта
        getIP(stats.port<1024||stats.port>=65535?1337:stats.port);
    });
}
//Предподгоотовка к запуску сервера
function host(){
    //Cкрываем панель настройки сервера
    var create = document.getElementById('create');
    create.classList.add('hide');
    //Показываем меню сервера
    var hold = document.getElementById('hold');
    hold.classList.remove('hide');
    //Получаем данные из формы
    stats.serverName = document.getElementById('name');
    stats.port = document.getElementById("port").value;
    stats.map = document.getElementById("level").value;
    stats.test = document.getElementById("test").value;
    //Запускаем сервер
    startSrv();
}
//Функция для вывода ip-адресов сервера на экран
function getIP(port) {
    //Переменная для списка ip-адресов
    var list= [];
    //Получаем доступ к сетевым интерфейсам
    var os = require('os');
    var ifaces = os.networkInterfaces();
    //Добавляем найденые адреса в список
    Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
            //Исклюения на IPv6 и loopback адреса
            if ('IPv4' !== iface.family || iface.internal !== false) return;
            list.push(iface.address)
        })});
    //Вывод списка на экран
    var content = "<li>ips:</li>";
    for(var i=0;i<list.length;i++){
        content+="<li>"+list[i]+":"+port+"</li>";
    }
    var ips = document.getElementById("ips");   
    ips.innerHTML = content;
}   
