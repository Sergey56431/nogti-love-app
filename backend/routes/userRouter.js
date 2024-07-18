const UserRouter = require('express')
const userRouter = new UserRouter()
const middlewares = require('../midlewares/midlewares'); // Импорт Мидлвэйрс
const handlers = require('../handlers/handlers'); // Импорт Хэндлерс
const adminRoutes = require('./adminRouter') // Импорт админских маршрутов

// Использование маршрутов
userRouter.use('/api', middlewares.verifyTokenMiddleware);
userRouter.get('/logout', middlewares.authorizationMiddleware, handlers.logoutHandler);
userRouter.get('/user-balance', middlewares.verifyTokenMiddleware, handlers.getBalance);
userRouter.post('/token', handlers.tokenHandler);
userRouter.post('/register', handlers.registrationHandler);
userRouter.post('/login', handlers.loginHandler);
userRouter.use('/adm', adminRoutes);

userRouter.use(handlers.notFoundHandler); // Несуществующий маршрут!!

module.exports = userRouter;