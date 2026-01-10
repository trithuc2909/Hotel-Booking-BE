import config from './config';
import app from './app';
import logger from './config/logger.config';


const PORT = config.app.port;

app.listen(PORT, () => {
    logger.info(`🚀 Server is running on port ${PORT} in ${config.env} mode`);
})