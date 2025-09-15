import logger from "src/utils/logger";
async function globalTeardown() {
	logger.info("Global teardown");
}
export default globalTeardown;
