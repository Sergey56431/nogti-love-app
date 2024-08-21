const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const mysql = require("mysql");
require('dotenv').config();
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, START_POINTS, SECRET_KEY, REFRESH_SECRET_KEY} = process.env;

let db = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
});
// Подключаемся к базе данных и ловим возможные ошибки подключения
db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        process.exit(1); // Прекращаем процесс в случае ошибки
    }
    console.log('Подключен к БД..');
});
function registrationHandler(req, res) {
    const { username, password, phone, email } = req.body;

    // Проверяем, все ли поля предоставлены
    if (!username || !password || !phone || !email) {
        return res.status(400).json({message: 'Необходимо заполнить все поля.'});
    }

    // Шифруем пароль
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Проверяем, существует ли уже пользователь с таким именем
    db.query('SELECT * FROM Users WHERE user_name = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({message: 'Ошибка при обращении к базе данных.'});
        }
        if (results.length > 0) {
            return res.status(409).json({message: 'Пользователь с таким именем уже существует.'});
        } else {
            // Добавляем пользователя в базу данных
            db.query('INSERT INTO Users (user_name, user_password, user_phone, user_email, points) VALUES (?, ?, ?, ?, ?)',
                [username, hashedPassword, phone, email, Number(START_POINTS)],
                (err, result) => {
                    if (err) {
                        return res.status(500).json({message: 'Ошибка при добавлении пользователя.'});
                    }
                    return res.status(201).json({message: 'Пользователь успешно зарегистрирован.'});
                });
        }
    });
} // Записываем в БД нового юзера
function loginHandler(req, res) {
    const { username, password } = req.body;

    // Проверяем, все ли поля предоставлены
    if (!username || !password) {
        return res.status(400).send('Необходимо заполнить все поля.');
    }
    // Ищем пользователя в базе данных
    db.query('SELECT * FROM Users WHERE user_name = ?', [username], (err, users) => {
        if (err) {
            return res.status(500).send('Ошибка при обращении к базе данных.');
        }
        if (users.length === 0) {
            return res.status(401).send('Пользователь не найден.');
        }

        const user = users[0];

        // Проверяем пароль
        const isMatch = bcrypt.compareSync(password, user.user_password);
        if (!isMatch) {
            return res.status(401).send('Неверный пароль.');
        }

        // Создаем токены
        const accessToken = jwt.sign(
            { id: user.user_id, username: user.user_name, userpoints: user.points },
            SECRET_KEY,
            { expiresIn: '30m' });
        const refreshToken = jwt.sign(
            { id: user.user_id, username: user.user_name, userpoints: user.points },
            REFRESH_SECRET_KEY,
            { expiresIn: '14d' });

        // Сохраняем refresh токен и access токен в базе данных для пользователя
        db.query('UPDATE Users SET refresh_token = ?, access_token = ? WHERE user_id = ?', [refreshToken, accessToken, user.user_id], (updateErr, updateResult) => {
            if (updateErr) {
                return res.status(500).json({ message: 'Ошибка при обновлении токенов пользователя в базе данных', error: updateErr });
            }
            // Здесь мы отправим только accessToken в теле ответа, а refreshToken следует установить в httpOnly cookie или отправить по безопасному каналу
            return res
                .cookie("refresh_token", refreshToken, {
                    httpOnly: true,
                    secure: true,
                    sameSite: 'strict'
                }) // Запись refreshToken в куки
                .status(200)
                .json({accessToken: accessToken}); // Обычно refreshToken не отправляется через тело ответа
        });
    });
} // Генерируем новые токены, записываем в БД и передаем их
function tokenHandler(req, res) {
    const token = req.cookies.refresh_token;
    if (!token) {
        return res.sendStatus(401).send("Не авторизован"); // Ответ "не авторизован", если токен не предоставлен
    }

    // Пытаемся подтвердить refresh токен
    jwt.verify(token, REFRESH_SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403).send('Запрещено'); // Ответ "запрещено", если токен неверный

        // Если токен верный, создаем новый access токен
        const accessToken = jwt.sign({ id: user.user_id, username: user.user_name, userpoints: user.points},
            SECRET_KEY,
            { expiresIn: '30m' });
        res.json({ accessToken });
    });
}
function logoutHandler(req, res){
    // Очищаем куки и отправляем подтверждение успешного выхода
    res
        .clearCookie("refresh_token")
        .status(200)
        .json({ message: "Вы успешно вышли из системы. До встречи!" });
} // Удаляем куки
function getBalance(req, res){
    const { id } = req.body;
    db.query('SELECT points FROM Users WHERE user_id = ?', [id], (err, result) => {
        if(err || result.length === 0) {
            return res.status(500).send('Ошибка при получении баланса');
        } else {
            res.json({ balance: result[0].points });
        }
    });
}
function addBalance(req, res){
    const { id, points } = req.body;
    db.query('SELECT points FROM Users WHERE user_id = ?', [id], (err, result) => {
        if(err || result.length === 0) {
            return res.status(500).send('Ошибка при изменении баланса');
        } else {

            let balance = result[0].points + points;
            db.query('UPDATE Users SET points = ? WHERE user_id = ?', [balance, id], (err, result) =>{
                if(err || result.length === 0) {
                    return res.status(500).send('Ошибка при изменении баланса');
                }
                return res.status(200).send('Баланс успешно изменен');
            });

        }
    });
}
function delBalance(req, res){
    const { id, points } = req.body;
    db.query('SELECT points FROM Users WHERE user_id = ?', [id], (err, result) => {
        if(err || result.length === 0) {
            return res.status(500).send('Ошибка при изменении баланса');
        } else {
            if (result[0].points > points) {
                let balance = result[0].points - points;
                db.query('UPDATE Users SET points = ? WHERE user_id = ?', [balance, id], (err, result) =>{
                    if(err || result.length === 0) {
                        return res.status(500).send('Ошибка при изменении баланса');
                    }
                    return res.status(200).send('Баланс успешно изменен');
                });
            }
        }
    });
}
function notFoundHandler(req, res){
    res.status(404).send('Страница, которую вы ищете, не существует. 🤔');
}

module.exports = {
    registrationHandler,
    loginHandler,
    tokenHandler,
    logoutHandler,
    getBalance,
    addBalance,
    delBalance,
    notFoundHandler
};
