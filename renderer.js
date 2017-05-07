//Функция срабатывает при загрузке страницы
window.addEventListener("load",function(){
  //Подключение модуля nw.gui для работы с окном
  //подробнее на http://docs.nwjs.io/en/latest/References/Window/#wincloseforce
  var gui = require('nw.gui');
  var win = gui.Window.get();
  //Закоментированные строки отвечают за инструмент отладки devtools
  /*
  var mainWindow = document.getElementById('mainWindow');
  win.showDevTools(mainWindow);
  */
  //Сворачивание окна
  document.getElementById("min-btn").addEventListener("click", function (e) {
    win.minimize();
  });
  //Закрытие окна
  document.getElementById("close-btn").addEventListener("click", function (e) {
    win.close();
  });
});