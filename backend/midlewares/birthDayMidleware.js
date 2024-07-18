const schedule = require('node-schedule');
const mysql = require("mysql");
require('dotenv').config();
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, BIRHDAY_POINTS} = process.env;

let db = mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
});

const checkBirthdayAndRewardPoints = () => {
    var today = new Date();
    var month = today.getMonth() + 1;
    var day = today.getDate();

    db.query('SELECT * FROM Users WHERE MONTH(birth_date) = ? AND DAY(birth_date) = ?', [month, day], (error, results) => {
        if (error) {
            return(results.status(500).json({error: 'Ошибка при обращении к базе данных.'}));
        }

        if (results.length > 0) {
            results.forEach((person) => {
                db.query('UPDATE Users SET points = ? WHERE user_id = ?', [Number(BIRHDAY_POINTS)+person.points, person.user_id]);
                console.log('Пользователю ' + person.user_name + ' начисленно 101 баллов в честь дня рождения!');
            });
        }
    });
};

// Расписание для выполнения действий каждый день в 00:00
const rule = new schedule.RecurrenceRule();
rule.hour = 0;
rule.minute = 0;

// Создание задачи для расписания
schedule.scheduleJob(rule, checkBirthdayAndRewardPoints);

module.exports = checkBirthdayAndRewardPoints;