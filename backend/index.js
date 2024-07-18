const bodyParser = require("body-parser"); // Для парсинга JSON-данных в запросах
const express = require('express'); // Для сервера
const app = express(); // Для сервера
const cors = require('cors'); // CORS политика
require('dotenv').config(); // Что б переменные секретные брать
const port = process.env.PORT || 3001 // Либо порт в секретной переменной либо 3001
const cookieParser = require("cookie-parser");// Для работы с куки
const userRoutes = require('./routes/userRouter');
const adminRoutes = require('./routes/adminRouter');

const birth = require('./midlewares/birthDayMidleware');

// Импорт необходимых файлов
app.use(cookieParser()); // Для работы с куки
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
}); // Попытка добавления заголовков
app.use(cors()); //  Для доступа запросов из вне CORS
app.use(bodyParser.urlencoded({ extended: true })); // Для использования тела запроса
app.use(express.json()); // Для парсинга JSON-данных в запросах
app.use(express.static('../frontend')); //Шоб индекс работал

app.use(userRoutes); // Маршруты пользователей
app.use('/adm', adminRoutes) // Маршруты админа
app.use((req, res, next) => {
    birth().catch(next);
});

// Запускаем сервер
app.listen(port, () => {
    console.log('Сервер запущен на порту http://localhost:' + port);
});