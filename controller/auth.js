const express = require('express');
const router = express.Router();
const dotenv = require('dotenv').config();
const loginService = require("../service/loginService.js");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Auth 관련 API
 */

/**
 * @swagger
 * /auth/login:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Login with 42 API
 *     description: Get user info with 42 API and give user user id and Tokens
 *     operationId: authLogin
 *     parameters:
 *       - name: code
 *         in: query
 *         description: value of code for 42 API login
 *         required: true
 *         explode: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginInfo'
 *       '400':
 *         description: "ApiInfoGetError"
 *       '500':
 *         description: "TokenSignError or InternalServerError"
 */
/* LOGIN */
router.get("/login", async (req, res) => {
	try {
		const result = await loginService.setUserAndCreateToken(req.query.code, false);
		res.status(200).send(result);
	} catch (error) {
		res.status(error.status || 500).send(error.name || "InternalServerError");
	}
})

/**
 * @swagger
 * /auth/admin:
 *   get:
 *     tags:
 *       - Auth
 *     summary: 관리자용 Login with 42 API
 *     description: Get user info with 42 API and give user user id and Tokens 관리자 권한으로 로그인을 시도한다.
 *     operationId: adminLogin
 *     parameters:
 *       - name: code
 *         in: query
 *         description: value of code for 42 API login
 *         required: true
 *         explode: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginInfo'
 *       '400':
 *         description: "ApiInfoGetError"
 *       '500':
 *         description: "TokenSignError or InternalServerError"
 */
/* LOGIN */
router.get("/admin", async (req, res) => {
	try {
		const result = await loginService.setUserAndCreateToken(req.query.code, true);
		res.status(200).send(result);
	} catch (error) {
		res.status(error.status || 500).send(error.name || "InternalServerError");
	}
})

/**
 * @swagger
 *   /auth/refresh:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Auth
 *     summary: Get access token by refresh token
 *     description: Get new set of access token and refresh token
 *     operationId: authRefresh
 *     parameters:
 *       - name: userId
 *         in: query
 *         description: user id who wants to get new token set
 *         required: true
 *         explode: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: successful login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenSet'
 *       '402':
 *         description: "TokenAuthorizeError"
 *       '500':
 *         description: "TokenSignError or InternalServerError"
 */
/* ACCESS TOKEN REFRESH */
router.get("/refresh", async (req, res) => {
	try{
		const result = await loginService.createNewTokenSet(req.query.userId, req.headers.authorization);
		res.status(200).send(result);
	} catch(error) {
		res.status(error.status || 500).send(error.name || "InternalServerError");
	}
});

/**
 * @swagger
 *   /auth/logout:
 *   delete:
 *     tags:
 *       - Auth
 *     summary: Logout current user
 *     description: Get refresh token to expire
 *     operationId: authLogout
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: userId
 *         in: query
 *         description: user id who wants to get access token
 *         required: true
 *         explode: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: successful logout
 *       '402':
 *         description: "TokenAuthorizeError"
 *       '500':
 *         description: "LogoutError"
 */
router.delete("/logout", async (req, res) => {
	try {
		const result = await loginService.logoutRefreshToken(req.query.userId, req.headers.authorization);
		res.status(200).send();
	} catch(error) {
		res.status(error.status || 500).send(error.name || "InternalServerError");
	}
});

module.exports = router;


/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "65e56ff8984f3a5190f0c4e6"
 *         user_id:
 *           type: string
 *           example: "158010"
 *         name:
 *           type: string
 *           example: "minjacho"
 *         displayname:
 *           type: string
 *           example: "MinJae Choi"
 *         profile_img:
 *           type: string
 *           example: "https://cdn.intra.42.fr/users/1bf8948249e8d63a265c19b793c62bc9/small_minjacho.jpg"
 *         createdAt:
 *           type: string
 *           example: "2024-03-04T06:53:44.216Z"
 *         updatedAt:
 *           type: string
 *           example: "2024-03-04T06:53:44.216Z"
 *         __v:
 *           type: integer
 *           example: 0
 *     LoginInfo:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           example: "158010"
 *         role:
 *           type: string
 *           example: "client"
 *         accessToken:
 *           type: string
 *           example: "<token>"
 *         refereshToken:
 *           type: string
 *           example: "<token>"
 *     UserName:
 *       type: string
 *       properties:
 *         userName
 *     TokenSet:
 *       type: object
 *       properties:
 *         admin:
 *           type: string
 *           example: "true"
 *         accessToken:
 *           type: string
 *           example: "<token>"
 *         refreshToken:
 *           type: string
 *           example: "<token>"
 */
