const bookException = require('../exception/bookException');
const bookRepository = require('../repository/bookRepository');
const userRepository = require('../repository/userRepository');

/*	[addBook]
	해당 기기가 유효한지 검사
	예약 시간이 유효한지 검사
	유저 id로 유저 검색 (존재하는 유저인지 검사)
	해당 시간대에 해당 유저가 예약중인지 존재하는지 검사
	해당 시간대에 같은 기기가 예약중인지 검사
	=> 예약 추가 */
const addBook = async function (userId, start, end, date, type) {
	try {
		await verifyBook(userId, start, end, date, type);
		var result = await bookRepository.createBook(
			userId, start, end, date, type
		);
		return result;
	} catch (error) {
		throw error;
	}
};

/*	[verifyBook]
	=> 유효한 예약인지 검사 */
const verifyBook = async function (userId, start, end, date, type) {
	try {
		if (type < 1 || type > 3)
			throw new bookException.InvalidTypeError('from service');
		if (start >= end || start > 144 || start < 0 || end > 144 || end < 0)
			throw new bookException.InvalidTimeError('from service');
		await userRepository.findUserById(userId);
		var bookOfUserAtTime = await bookRepository.findBookOfUserAtTime(userId, start, end, date);
		if (bookOfUserAtTime.length > 0)
			throw new bookException.BookTimeConfilctError('from service');
		var bookList = await bookRepository.findBookAtTime(
			type,start,end,date
		);
		if (bookList.length > 0)
			throw new bookException.BookTimeConfilctError('from service');
	} catch (error) {
		throw error;
	}
}

/*	[findBookById]
	=> 예약 id로 단일 예약 정보 조회 */
const findBookById = async function (bookId) {
	try {
		var book = await bookRepository.findBookById(bookId);
		if (book === null)
			throw new bookException.BookNotFoundError("from service");
		return book;
	} catch (error) {
		throw error;
	}
};

/*	[findBookListOfDate]
	=> 특정 날짜의 특정 타입으로 모든 예약 목록 조회 */
const findBookListOfDate = async function (date, type) {
	try {
		var bookList = await bookRepository.findBooksAtDate(date, type);
		return bookList;
	} catch (error) {
		throw error;
	}
};

/*	[findBookListOfUserByTypeAndDate]
	유저 id로 존재하는 유저인지 검사
	=> 유저의 예약 목록 조회 (특정 날짜의 특정 타입) */
const findBookListOfUserByTypeAndDate = async function (userId, type, date) {
	try {
		await userRepository.findUserById(userId);
		var bookList;
		if (type) {
			bookList = await bookRepository.findBooksByUserIdAndTypeAndDate(userId, type, date);
		}
		else {
			bookList = await bookRepository.findBooksByUserIdAndDate(userId, date);
		}
		return bookList;
	} catch (error) {
		throw error;
	}
};

/*	[findBookListOfUser]
	유저 id로 해당 유저가 존재하는지 검사
	=> 해당 유저의 특정 타입으로 모든 예약 목록 조회 */
const findBookListOfUser = async function (userId, type) {
	try {
		await userRepository.findUserById(userId);
		var bookList = await bookRepository.findBooksByUserId(userId, type);
		return bookList;
	} catch (error) {
		throw error;
	}
};

/*	[updateBook]
	유저 id로 해당 유저가 존재하는지 검사
	=> 해당 유저의 해당 예약 id로 예약 정보 수정 */
const updateBookById = async function (userId, bookId, start, end, date, type) {
	try {
		await verifyBook(userId, start, end, date, type);
		return await bookRepository.updateBookById(userId, bookId, start, end, date, type);
	} catch (error) {
		throw error;
	}
};

/*	[deleteBook]
	유저 id로 해당 유저가 존재하는지 검사
	=> 해당 유저의 해당 예약 id로 예약 정보 삭제 */
const deleteBookById = async function (userId, bookId) {
	try {
		await bookRepository.deleteBookById(userId, bookId);
	} catch (error) {
		throw error;
	}
};


module.exports = {
	addBook,
	findBookListOfUser,
	findBookListOfDate,
	findBookListOfUserByTypeAndDate,
	updateBookById,
	findBookById,
	deleteBookById
};