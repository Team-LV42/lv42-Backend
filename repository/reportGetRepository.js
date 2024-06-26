const mariadbPool = require('../config/mariadbConfig');
const logger = require('../config/logger');
const reportGetException = require('../exception/reportGetException');
const mariadbException = require('../exception/mariadbException');
const { Exception, DefaultException} = require('../exception/exception');

const getConsoleList = async () => {
	let connection;
	let results;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			SELECT *
			FROM console;
		`;
		results = await connection.query(query);
		logger.info("### Successfully fetched all console info");
		return results;
	} catch (error) {
		logger.info("### Failed to fetch all console info");
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

const getDeviceListByConsoleId = async (console_id, device_type) => {
	let connection;
	let results;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			SELECT *
			FROM device
			WHERE console_id = ${console_id}
			AND device_type = ${device_type};
		`;
		results = await connection.query(query);
		logger.info("### Successfully fetched all device info");
		return results;
	} catch (error) {
		logger.info("### Failed to fetch all device info");
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

const getMalfunctionTypeList = async () => {
	let connection;
	let results;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			SELECT *
			FROM malfunction_type;
		`;
		results = await connection.query(query);
		logger.info("### Successfully fetched all malfunction_type info");
		return results;
	} catch (error) {
		logger.info("### Failed to fetch all malfunction_type info");
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

const getControllerButtonTypeList = async (device_type) => {
	let connection;
	let results;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			SELECT *
			FROM controller_button_type_${device_type};
		`;
		results = await connection.query(query);
		logger.info(`### Successfully fetched all controller_button_type_${device_type} info`);
		return results;
	} catch (error) {
		logger.info(`### Failed to fetch all controller_button_type_${device_type} info`);
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		if (error.code == "ER_NO_SUCH_TABLE")
			throw new reportGetException.ControllerButtonTableNotExist('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

const getButtonMalfunctionTypeList = async () => {
	let connection;
	let results;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			SELECT *
			FROM button_malfunction_type;
		`;
		results = await connection.query(query);
		logger.info(`### Successfully fetched all button_malfunction_type info`);
		return results;
	} catch (error) {
		logger.info(`### Failed to fetch all button_malfunction_type info`);
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

const insertDevice = async (id, name, console_id, device_type, status) => {
	let connection;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			INSERT INTO device (id, name, console_id, device_type, status)
			VALUES ('${id}', '${name}', ${console_id}, ${device_type}, '${status}');
		`;
		await connection.query(query);
		logger.info('### INSERT DEVICE SUCCESS');
	} catch (error) {
		logger.info('### INSERT DEVICE FAIL');
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		if (error.code == "ER_DUP_ENTRY")
			throw new mariadbException.MariadbDupEntryError('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

const insertMalfunctionType = async (name, description) => {
	let connection;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			INSERT INTO malfunction_type (name, description)
			VALUES ('${name}', '${description}');
		`;
		await connection.query(query);
		logger.info('### INSERT malfunction_type SUCCESS');
	} catch (error) {
		logger.info('### INSERT malfunction_type FAIL');
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

const insertButtonMalfunctionType = async (name, description) => {
	let connection;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			INSERT INTO button_malfunction_type (name, description)
			VALUES ('${name}', '${description}');
		`;
		await connection.query(query);
		logger.info('### INSERT button_malfunction_type SUCCESS');
	} catch (error) {
		logger.info('### INSERT button_malfunction_type FAIL');
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

const updateDeviceStatus = async (id, status) => {
	let connection;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			UPDATE device
			SET status = ${status}
			WHERE id = '${id}';
		`;
		const result = await connection.query(query);
		if (result.affectedRows < 1)
			throw new mariadbException.MariadbZeroRowAffectedError('In Repository');
		logger.info('### UPDATE DEVICE STATUS SUCCESS');
	} catch (error) {
		logger.info('### UPDATE DEVICE STATUS FAIL');
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

const isDeviceIdExist = async (id) => {
	let connection;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			SELECT * FROM device
			WHERE id = '${id}';
		`;
		const result = await connection.query(query);
		if (!result.length)
			throw Error();
		logger.info(`### DEVICE ID EXIST`);
	} catch (error) {
		logger.info("### DEVICE ID DOESN'T EXIST");
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw new reportGetException.DeviceIdNotExistError('In Repository');
	} finally {
		if (connection) connection.release();
	}
};

const isControllerButtonTableExist = async (table_name) => {
	let connection;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			SELECT table_name FROM information_schema.tables
			WHERE table_schema = '${process.env.MARIADB_DATABASE}'
			AND table_name = '${'controller_button_type_' + table_name}';
		`;
		const result = await connection.query(query);
		if (!result.length)
			throw Error();
		logger.info(`### ${'controller_button_type_' + table_name} TABLE EXIST`);
	} catch (error) {
		logger.info("### ${'controller_button_type_' + table_name} TABLE DOESN'T EXIST");
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw new reportGetException.ControllerButtonTableNotExist('In Repository');
	} finally {
		if (connection) connection.release();
	}
};

const deleteDevice = async (id) => {
	let connection;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			DELETE FROM device
			WHERE id = '${id}';
		`;
		const result = await connection.query(query);
		if (result.affectedRows < 1)
			throw new mariadbException.MariadbZeroRowAffectedError('In Repository');
		logger.info('### DELETE DEVICE SUCCESS');
	} catch (error) {
		logger.info('### DELETE DEVICE FAIL');
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

const deleteMalfunctionType = async (id) => {
	let connection;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			DELETE FROM malfunction_type
			WHERE id = '${id}';
		`;
		const result = await connection.query(query);
		if (result.affectedRows < 1)
			throw new mariadbException.MariadbZeroRowAffectedError('In Repository');
		logger.info('### DELETE MALFUNCTION TYPE SUCCESS');
	} catch (error) {
		logger.info('### DELETE MALFUNCTION TYPE FAIL');
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

const deleteButtonMalfunctionType = async (id) => {
	let connection;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			DELETE FROM button_malfunction_type
			WHERE id = '${id}';
		`;
		const result = await connection.query(query);
		if (result.affectedRows < 1)
			throw new mariadbException.MariadbZeroRowAffectedError('In Repository');
		logger.info('### DELETE BUTTON MALFUNCTION TYPE SUCCESS');
	} catch (error) {
		logger.info('### DELETE BUTTON MALFUNCTION TYPE FAIL');
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

const getDeviceStatus = async (id) => {
	let connection;
	try {
		connection = await mariadbPool.getConnection();
		const query = `
			SELECT status FROM device
			WHERE id = '${id}';
		`;
		const result = await connection.query(query);
		if (!result.length)
			throw new reportGetException.DeviceIdNotExistError('In Repository');
		logger.info('### GET DEVICE STATUS SUCCESS');
		return (result[0].status);
	} catch (error) {
		logger.info('### GET DEVICE STATUS FAIL');
		if (error.code == "ER_GET_CONNECTION_TIMEOUT")
			throw new mariadbException.MariadbConnectionTimeout('In Repository');
		throw (error instanceof Exception ? error : new DefaultException('repository', error.name));
	} finally {
		if (connection) connection.release();
	}
};

module.exports = {
	getConsoleList,
	getDeviceListByConsoleId,
	getMalfunctionTypeList,
	getControllerButtonTypeList,
	getButtonMalfunctionTypeList,
	insertDevice,
	insertMalfunctionType,
	insertButtonMalfunctionType,
	updateDeviceStatus,
	isDeviceIdExist,
	isControllerButtonTableExist,
	deleteDevice,
	deleteMalfunctionType,
	deleteButtonMalfunctionType,
	getDeviceStatus
};
