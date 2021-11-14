'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2021-11-11T17:01:17.194Z',
    '2021-11-13T17:36:17.929Z',
    '2021-11-14T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const btnLogin = document.querySelector('.login__btn');
const inputLoginUser = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const app = document.querySelector('.app');
const welcomeMess = document.querySelector('.welcome');
const movContainer = document.querySelector('.movements');
const curDate = document.querySelector('.date');
const balaceEl = document.querySelector('.balance__value');
const interestEl = document.querySelector('.summary__value--interest');
const sumInEl = document.querySelector('.summary__value--in');
const sumOutEl = document.querySelector('.summary__value--out');
const btnTrasfer = document.querySelector('.form__btn--transfer');
const inputTrasferTo = document.querySelector('.form__input--to');
const inputTrasferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const inputCloseUser = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
const btnSort = document.querySelector('.btn--sort');
const timerEl = document.querySelector('.timer');

/////////////////////////////////////////////////
// Functions

const startLogOut = function () {
  const tick = function () {
    timerEl.textContent = `${String(Math.trunc(time / 60)).padStart(
      2,
      0
    )}:${String(Math.trunc(time % 60)).padStart(2, 0)}`;

    if (time === 0) {
      clearInterval(timer);
      welcomeMess.textContent = 'Log in to get started';
      app.style.opacity = 0;
    }

    time--;
  };

  let time = 120;

  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

const formatNum = function (locale, num, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(num);
};

const displayMovements = function (acc, state = 1) {
  movContainer.textContent = '';

  const calcDay = function (date) {
    const fullDate = new Date(date);
    const pastDays = Math.trunc(
      (Number(new Date()) - Number(fullDate)) / (1000 * 60 * 60 * 24)
    );

    if (pastDays === 0) return 'TODAY';
    if (pastDays === 1) return 'YESTERDAY';
    if (pastDays <= 3) return `${pastDays} days ago`;

    return new Intl.DateTimeFormat(acc.locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(fullDate);
  };

  const movs =
    state === 1
      ? acc.movements
      : acc.movements.map(mov => mov).sort((a, b) => a - b);

  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const newMov = formatNum(acc.locale, Math.abs(mov), acc.currency);

    const date = calcDay(acc.movementsDates[i]);

    const html = `<div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${date}</div>
    <div class="movements__value">${newMov}</div>
  </div>`;

    movContainer.insertAdjacentHTML('afterbegin', html);
  });
};

const displayBalance = function (acc) {
  acc.balance = acc.movements.reduce((sum, mov) => (sum += mov), 0);
  balaceEl.textContent = formatNum(acc.locale, acc.balance, acc.currency);
};

const displaySummery = function (acc) {
  const inSum = acc.movements
    .filter(mov => mov > 0)
    .reduce((sum, mov) => (sum += mov), 0);

  const outSum = acc.movements
    .filter(mov => mov < 0)
    .reduce((sum, mov) => (sum += mov), 0);

  const interest = Number(((inSum * acc.interestRate) / 100).toFixed(2));

  sumInEl.textContent = formatNum(acc.locale, inSum, acc.currency);
  sumOutEl.textContent = formatNum(acc.locale, Math.abs(outSum), acc.currency);
  interestEl.textContent = formatNum(acc.locale, interest, acc.currency);
};

const display = function (acc) {
  displayMovements(acc);
  displayBalance(acc);
  displaySummery(acc);
};

const createUser = acc =>
  acc.owner
    .toLowerCase()
    .split(' ')
    .map(word => word[0])
    .join('');

let currentAcc,
  sortState = 1,
  timer;

accounts.forEach(acc => (acc.user = createUser(acc)));

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAcc = accounts.find(acc => acc.user === inputLoginUser.value);

  if (currentAcc.pin === Number(inputLoginPin.value)) {
    inputLoginUser.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    app.style.opacity = 100;

    welcomeMess.textContent = `Welcome back, ${currentAcc.owner.split(' ')[0]}`;
    curDate.textContent = `${new Intl.DateTimeFormat(currentAcc.locale, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    }).format(new Date())}`;

    if (timer) clearInterval(timer);
    timer = startLogOut();
    display(currentAcc);
  }
});

btnTrasfer.addEventListener('click', function (e) {
  e.preventDefault();

  const transferToAcc = accounts.find(acc => acc.user === inputTrasferTo.value);
  const amount = Number(inputTrasferAmount.value);

  if (
    accounts.includes(transferToAcc) &&
    amount > 0 &&
    currentAcc.user !== transferToAcc.user &&
    amount
  ) {
    inputTrasferTo.value = inputTrasferAmount.value = '';
    inputTrasferAmount.blur();

    setTimeout(function () {
      const date = new Date().toISOString();

      currentAcc.movementsDates.push(date);
      currentAcc.movements.push(-amount);

      transferToAcc.movements.push(amount);
      transferToAcc.movementsDates.push(date);

      clearInterval(timer);
      timer = startLogOut();

      display(currentAcc);
    }, 2000);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const loanAmount = Number(inputLoanAmount.value);

  if (
    loanAmount &&
    loanAmount > 0 &&
    loanAmount <= Math.max(...currentAcc.movements) * 0.1
  ) {
    inputLoanAmount.value = '';
    inputLoanAmount.blur();

    setTimeout(function () {
      currentAcc.movementsDates.push(new Date().toISOString());
      currentAcc.movements.push(loanAmount);

      clearInterval(timer);
      timer = startLogOut();

      display(currentAcc);
    }, 2000);
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const user = inputCloseUser.value;
  const pin = Number(inputClosePin.value);

  if (currentAcc.pin === pin && currentAcc.user === user) {
    inputCloseUser.value = inputClosePin.value = '';
    inputClosePin.blur();

    accounts.splice(accounts.indexOf(currentAcc), 1);

    welcomeMess.textContent = 'Log in to get started';
    app.style.opacity = 0;
  }
});

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  sortState = sortState === 1 ? 0 : 1;

  displayMovements(currentAcc, sortState);
});
