const AdminRouter = require('express')
const adminRouter = new AdminRouter()
const middlewares = require('../midlewares/midlewares'); // Импорт Мидлвэйрс
const handlers = require('../handlers/handlers'); // Импорт Хэндлерс

adminRouter.post('/user-add-balance', middlewares.verifyTokenMiddleware, handlers.addBalance);
adminRouter.post('/user-del-balance', middlewares.verifyTokenMiddleware, handlers.delBalance);

adminRouter.use(handlers.notFoundHandler); // Несуществующий маршрут!!

module.exports = adminRouter