//локальная еременная хранящая ФИО
var username="";
//Функция для перехода к серверной/клиентской части
function submit(type){
	if (username&&type){
		//Делаем переменную username доступной из любой локации
		global.username = username;
		location.assign(type+'/index.html')
	}
}