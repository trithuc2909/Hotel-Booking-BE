import config from "./config";
import app from "./app";
import logger from "./config/logger.config";
import { startJobs } from "./jobs";

const PORT = config.app.port;

app.listen(PORT, () => {
  logger.info(`🌍 Environment: ${config.env}`);
  logger.info(`🗄️  Database connected successfully`);
  logger.info(`🚀 Server is running on port ${PORT} in ${config.env} mode`);
  startJobs();
});
