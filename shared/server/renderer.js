//Считывание списка карт
function getMaps(){
  var path = require("path");
  var fs = require("fs");
  //Получение пути к картам
  var mapPath = path.join(global.__dirname,"maps/");
  var list = document.getElementById("level");
  list.innerHTML = "";
  //Просмотреть список элементов в папке
  fs.readdir(mapPath,function (err,files){
    if(err) throw err;
    //Отсеиваем все папки
    files.forEach(function (item) {
      fs.stat(path.join(mapPath,item),function(err,stats){
        if (err) throw err;
        if (stats.isDirectory()){
          //Добавляем папку в выпадающее меню
          list.innerHTML+="<option value=\""+item+"\">"+ item +"</option>";
        }})})})}
//Считывание списка тестов
function getTests(){
  var path = require("path");
  var fs = require("fs");
  //Получение пути к тестам
  var testPath = path.join(global.__dirname,"tests/");
  var list = document.getElementById("test");
  list.innerHTML="";
  //Просмотреть список элементов в папке
  fs.readdir(testPath,function (err,files){
    if(err) throw err;
    //Отсеиваем все папки
    files.forEach(function (item) {
      fs.stat(path.join(testPath,item),function(err,stats){
        if (err) throw err;
        //Добавляем папку в выпадающее меню
        if (stats.isDirectory()){
          list.innerHTML+="<option value=\""+item+"\">"+ item +"</option>";
        }})})})}
//Обновление списков при зпгрузке страницы
window.addEventListener("load", function() {
  getMaps();
  getTests();
});
