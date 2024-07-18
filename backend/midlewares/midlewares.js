
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { REFRESH_SECRET_KEY, SECRET_KEY, ADMIN_ID } = process.env;

const authorizationMiddleware = (req, res, next) => {
    const token = req.cookies.refresh_token; // Извлекаем токен из куки
    if (!token) {
        return res.status(401).send('Требуется токен для аутентификации.');
    }
    try {
        // Пытаемся подтвердить токен с использованием секрета
        jwt.verify(token, REFRESH_SECRET_KEY);
        next(); // Токен валиден, продолжаем обработку запроса
    } catch (error) {
        // Если токен недействителен, отправляем сообщение об ошибке
        return res.status(403).send('Неверный токен. Аутентификация не удалась.');
    }
}; // Проверяем токен
const verifyTokenMiddleware = (req, res, next) => {
    const accessToken = req.body.accessToken;
    jwt.verify(accessToken, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Неверный или истекший access токен' });
        } else {
            req.user = decoded;// Сохраняем раскодированные данные токена для последующего использования
            if (req.user.id == ADMIN_ID) {
                next();
            } else {
                return res.status(403).json({ error: 'Недостаточный уровень прав' });
            }
        }
    });
}; // Проверяем токен


module.exports = {
    authorizationMiddleware,
    verifyTokenMiddleware
};
