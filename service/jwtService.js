const jwt = require('jsonwebtoken');
const createRedisClient = require('./redisService.js');
const access_secret = process.env.JWT_ACCESS_SECRET;
const refresh_secret = process.env.JWT_REFRESH_SECRET;
const jwtException = require('../exception/jwtException.js');
var logger = require('../config/logger');

const tokenParse = (rawToken) => {
	try {
		if (rawToken.split(' ')[0] != "Bearer")
			throw Error();
		return rawToken.split(' ')[1];
	} catch(error) {
		throw new jwtException.TokenAuthorizeError("from service")
	}
}

/*	[accessTokenSign]
	access token의 payload에 user id 입력
	access token 발급
	실패시 TokenSignError
*/
const accessTokenSign = (userId) => {
	try {
		if (!(userId instanceof String))
			userId = userId.toString();
		const payload = {
			id: userId
		}
		const accessToken = jwt.sign(
			payload,
			access_secret, {
			algorithm: 'HS256',
			expiresIn: '1h'
		});
		logger.info("### Access Token Signed");
		return (accessToken);
	} catch(error) {
		throw new jwtException.TokenSignError("from service")
	}
};

/*	[accessTokenSign]
	access token verify 시도.
	access token payload의 user id와 query의 userId 비교
	실패시 TokenAuthorizeError
*/
const accessTokenVerify = (accessToken, userId) => {
	try {
		accessToken = tokenParse(accessToken);
		if (!(userId instanceof String))
		userId = userId.toString();
		const decoded = jwt.verify(accessToken, access_secret);
		logger.info("### Access Token Verified");
		if (decoded.id != userId) {
			throw new Error();
		}
		logger.info("### Access Token ID Verified");
		return (true);
	} catch (error) {
		throw new jwtException.TokenAuthorizeError("from service");
	}
};

/*	[refreshTokenSign]
	refresh token의 payload에 user id 입력
	새로은 refresh token 발급 2주 이후에는 자동 삭제
	실패시 TokenSignError
*/
const refreshTokenSign = async (userId) => {
	try {
		if (!(userId instanceof String))
			userId = userId.toString();
		const data = jwt.sign({
			id: userId
		}, refresh_secret, {
			algorithm: 'HS256',
			expiresIn: '14d',
		})
		const redisClient = await createRedisClient();
		const tokenScore = Date.now() / 1000;
		await redisClient.sendCommand(['ZADD', userId, tokenScore.toString(), data]); // userId set에 새로운 RT 추가
		logger.info("### Refresh Token Saved In Redis");
		const tokenLength = await redisClient.sendCommand(['ZCARD', userId]);
		if (tokenLength > 5)
		{
			await redisClient.sendCommand(['ZREMRANGEBYRANK', userId, '0', '0']);
			logger.info("### Oldest Refresh Token Deleted");
		}
		redisClient.quit();
		return (data);
	} catch (error) {
		throw new jwtException.TokenSignError("from service");
	}
}

/*
	[refreshTokenVerify]
	request RT가 Verify되는지 확인
	request RT의 payload에 저장된 user id가 query의 user id와 같은지 확인
	request RT가 userId의 set에 있는지 확인
	확인 후에 RT 삭제
	실패시 TokenAuthorizeError
	성공시 true 리턴
*/
const refreshTokenVerify = async (refreshToken, userId) => {
	try {
		if (!(userId instanceof String))
			userId = userId.toString();
		refreshToken = tokenParse(refreshToken);
		const decoded = jwt.verify(refreshToken, refresh_secret);
		logger.info("### Request RT verified");
		if (decoded.id != userId)
			throw Error();
		const redisClient = await createRedisClient();
		if (await redisClient.sendCommand(['ZSCORE', userId, refreshToken])) { // RT가 있는지 확인
			logger.info("### Requset RT is not used before");
		} else {
			await redisClient.sendCommand(['DEL', userId]);
			logger.info('### ' + userId + "'s all RT are deleted from redis because of security issue");
			throw Error();
		}
		await redisClient.sendCommand(['ZREM', userId, refreshToken]); // 사용된 RT set에서 삭제
		logger.info("### Make Request RT Expire");
		redisClient.quit();
	} catch (error) {
		throw new jwtException.TokenAuthorizeError("from service");
	}
}

/*	[refreshTokenDelete]
	query로 받은 userId에 해당하는 RT를 redis에서 제거한다.
*/
const refreshTokenDelete = async (userId, refreshToken) => {
	try {
		if (!(userId instanceof String))
			userId = userId.toString();
		refreshToken = tokenParse(refreshToken);
		const redisClient = await createRedisClient();
		await redisClient.sendCommand(['ZREM', userId, refreshToken]);
		redisClient.quit();
		logger.info("### " + userId + "'s RT Deleted From Redis");
	} catch (error) {
		throw new jwtException.LogoutError("from service");
	}
}

module.exports = {
	accessTokenSign,
	accessTokenVerify,
	refreshTokenSign,
	refreshTokenVerify,
	refreshTokenDelete
}
