var express = require('express');
var router = express.Router();
var bookService = require('../service/bookService');
var jwtService = require("../service/jwtService.js");

/**
 * @swagger
 * tags:
 *   name: Book
 *   description: Book 관련 API
 */

/**
 * @swagger
 * paths:
 *   /books/{userId}/list:
 *     get:
 *       tags:
 *         - Book
 *       summary: 해당 유저의 특정 타입, 특정 날짜의 예약 리스트 조회
 *       parameters:
 *         - name: userId
 *           in: path
 *           description: 유저 id
 *           required: true
 *           schema:
 *             type: integer
 *             format: int64
 *         - name: type
 *           in: query
 *           description: 게임 타입
 *           required: false
 *           schema:
 *             type: string
 *         - name: date
 *           in : query
 *           description: 날짜
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: 조회 성공
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Book'
 */
router.get('/:userId/list', async function(req, res, next) {
	try {
		var bookList = await bookService.findBookListOfUserByTypeAndDate(
			req.params.userId,
			req.query.type,
			req.query.date
		);
		res.status(200).send(bookList);
	}
	catch (error) {
		res.status(error.status || 500).send(error.name || 'InternalServerError');
	}
});

/**
 * @swagger
 * paths:
 *   /books/{userId}/history:
 *     get:
 *       tags:
 *         - Book
 *       summary: 해당 유저의 타입별 모든 예약기록 조회
 *       parameters:
 *         - name: userId
 *           in: path
 *           description: 유저 id
 *           required: true
 *           schema:
 *             type: integer
 *             format: int64
 *         - name: type
 *           in: query
 *           description: 게임 타입
 *           required: false
 *           schema:
 *             type: integer
 *             format: int64
 *       responses:
 *         '200':
 *           description: 조회 성공
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Book'
 */
router.get('/:userId/history', async function(req, res, next) {
	try {
		var bookList = await bookService.findBookListOfUser(
			req.params.userId,
			req.query.type
		);
		res.status(200).send(bookList);
	} catch (error) {
		res.status(error.status || 500).send(error.name || 'InternalServerError');
	}
});

/**
 * @swagger
 * paths:
 *   /books:
 *     get:
 *       tags:
 *         - Book
 *       summary: 해당 날짜의 타입별 모든 예약 목록 조회
 *       parameters:
 *         - name: date
 *           in: query
 *           description: 날짜
 *           required: true
 *           schema:
 *             type: string
 *         - name: type
 *           in: query
 *           description: 타입
 *           required: false
 *           scehma:
 *             type: int
 *             format: int64
 *       responses:
 *         '200':
 *           description: 조회 성공
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Book'
 */
router.get('/', async function(req, res, next) {
	try {
		var bookList = await bookService.findBookListOfDate(
			req.query.date,
			req.query.type
		);
		res.status(200).send(bookList);
	} catch (error) {
		res.status(error.status || 500).send(error.name || 'InternalServerError');
	}
})

/**
 * @swagger
 * paths:
 *   /books/{bookId}:
 *     get:
 *       tags:
 *         - Book
 *       summary: 단일 예약 정보 조회
 *       parameters:
 *         - name: bookId
 *           in: path
 *           description: 예약 id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: 조회 성공
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Book'
 *         '404':
 *           description: 조회 실패
 */
router.get('/:bookId', async function (req, res, next) {
	try {
		var bookList = await bookService.findBookById(
			req.params.bookId
		);
		res.status(200).send(bookList);
	} catch (error) {
		res.status(error.status || 500).send(error.name || 'InternalServerError');
	}
})

/**
 * @swagger
 * paths:
 *   /books:
 *     post:
 *       security:
 *         - bearerAuth: []
 *       tags:
 *         - Book
 *       summary: 예약 생성
 *       parameters:
 *         - name: userId
 *           in: query
 *           description: 유저 id
 *           required: true
 *           schema:
 *             type: string
 *       requestBody:
 *         description: 새 예약 생성
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddBook'
 *         required: true
 *       responses:
 *         '200':
 *           description: 생성 성공
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Book'
 *         '404':
 *           description: 사용자를 찾지 못함
 *         '400':
 *           description: 유효하지 않은 예약시간 또는 타입이거나 시간 겹침
 */
router.post('/', async function(req, res, next) {
	try {
		jwtService.accessTokenVerify(req.headers.authorization, req.query.userId);
		var book = await bookService.addBook(
			req.query.userId,
			req.body.start,
			req.body.end,
			req.body.date,
			req.body.type
		);
		res.status(200).send(book);
	} catch (error) {
		res.status(error.status || 500).send(error.name || 'InternalServerError');
	}
});

/**
 * @swagger
 * paths:
 *   /books:
 *     patch:
 *       security:
 *         - bearerAuth: []
 *       tags:
 *         - Book
 *       summary: 예약 수정
 *       parameters:
 *         - name: userId
 *           in: query
 *           description: 유저 id
 *           required: true
 *           schema:
 *             type: string
 *         - name: bookId
 *           in: query
 *           description: 예약 id
 *           required: true
 *           schema:
 *             type: string
 *       requestBody:
 *         description: 예약 수정
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AddBook'
 *         required: true
 *       responses:
 *         '200':
 *           description: 수정 성공
 *           content:
 *             application/json:
 *               schema:
 *                 $ref: '#/components/schemas/Book'
 *         '404':
 *           description: 사용자를 찾지 못함
 *         '400':
 *           description: 유효하지 않은 예약시간 또는 타입이거나 시간 겹침
 */
router.patch('/', async function (req, res, next) {
	try {
		jwtService.accessTokenVerify(req.headers.authorization, req.query.userId);
		var book = await bookService.updateBookById(
			req.query.userId,
			req.query.bookId,
			req.body.start,
			req.body.end,
			req.body.date,
			req.body.type
		);
		res.status(200).send(book);
	} catch (error) {
		res.status(error.status || 500).send(error.name || 'InternalServerError');
	}
});

/**
 * @swagger
 * paths:
 *   /books:
 *     delete:
 *       security:
 *         - bearerAuth: []
 *       tags:
 *         - Book
 *       summary: 예약 삭제
 *       parameters:
 *         - name: userId
 *           in: query
 *           description: 유저 id
 *           required: true
 *           schema:
 *             type: string
 *         - name: bookId
 *           in: query
 *           description: 예약 id
 *           required: true
 *           schema:
 *             type: string
 *       responses:
 *         '200':
 *           description: 삭제 성공
 *         '404':
 *           description: 사용자를 찾지 못함
 */
router.delete('/', async function (req, res, next) {
	try {
		jwtService.accessTokenVerify(req.headers.authorization, req.query.userId);
		await bookService.deleteBookById(
			req.query.userId,
			req.query.bookId
		);
		res.status(200).send('success');
	} catch (error) {
		res.status(error.status || 500).send(error.name || 'InternalServerError');
	}
})

/**
 * @swagger
 * components:
 *   schemas:
 *     Book:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: '65e5c61953b34730acd76279'
 *         user_id:
 *           type: string
 *           example: '12345'
 *         start_time:
 *           type: integer
 *           example: 10
 *         end_time:
 *           type: integer
 *           example: 11
 *         date:
 *           type: string
 *           example: '2023-03-04'
 *         type:
 *           type: integer
 *           example: 3
 *         createdAt:
 *           type: ISODate
 *           example: ISODate('2024-03-04T13:01:13.534Z')
 *         updatedAt:
 *           type: ISODate
 *           example: ISODate('2024-03-04T13:01:13.534Z')
 *         user:
 *           type: object
 *     AddBook:
 *       type: object
 *       properties:
 *         start:
 *           type: integer
 *           example: 13
 *         end:
 *           type: integer
 *           example: 15
 *         date:
 *           type: string
 *           example: '2023-03-04'
 *         type:
 *           type: integer
 *           example: 3
 */

module.exports = router;
