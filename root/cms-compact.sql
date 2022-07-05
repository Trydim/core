-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Фев 09 2022 г., 16:01
-- Версия сервера: 10.3.13-MariaDB-log
-- Версия PHP: 7.3.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- База данных: `cms`
--

-- --------------------------------------------------------

--
-- Структура таблицы `customers`
--

CREATE TABLE `customers` (
  `ID` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'NoName',
  `ITN` varchar(15) DEFAULT NULL,
  `contacts` varchar(255) DEFAULT '{}'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `customers`
--

INSERT INTO `customers` (`ID`, `name`, `ITN`, `contacts`) VALUES
(1, 'Петя', '', '{\"phone\":\"+7 (123) 456 78 97\",\"email\":\"as@as.by\",\"address\":\"test\"}');

-- --------------------------------------------------------

--
-- Структура таблицы `money`
--

CREATE TABLE `money` (
  `ID` int(10) UNSIGNED NOT NULL,
  `code` varchar(10) CHARACTER SET utf8 NOT NULL,
  `name` varchar(100) CHARACTER SET utf8 NOT NULL,
  `short_name` varchar(5) CHARACTER SET utf8 NOT NULL,
  `last_edit_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `scale` int(11) NOT NULL DEFAULT 1,
  `rate` decimal(10,4) NOT NULL DEFAULT 1.0000,
  `main` int(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `money`
--

INSERT INTO `money` (`ID`, `code`, `name`, `short_name`, `rate`, `main`) VALUES
(1, 'USD', 'United State Dollar', '$', '1.0000', 1),
(2, 'RUB', 'Российский рубль', 'руб.', '60.0000', 0),
(3, 'BYN', 'рубль', 'руб.', '2.5000', 0);

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE `orders` (
  `ID` int(10) UNSIGNED NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_edit_date` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `start_shipping_date` timestamp NULL DEFAULT NULL,
  `end_shipping_date` timestamp NULL DEFAULT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `total` float DEFAULT 0,
  `important_value` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '{}',
  `status_id` int(2) UNSIGNED NOT NULL DEFAULT 1,
  `save_value` varchar(500) CHARACTER SET utf8 NOT NULL DEFAULT '{}',
  `report_value` mediumblob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Структура таблицы `order_status`
--

CREATE TABLE `order_status` (
  `ID` int(2) UNSIGNED NOT NULL,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `order_status`
--

INSERT INTO `order_status` (`ID`, `name`) VALUES
(1, 'Заказ оформлен'),
(2, 'Заказ сформирован');

-- --------------------------------------------------------

--
-- Структура таблицы `permission`
--

CREATE TABLE `permission` (
  `ID` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL,
  `properties` varchar(255) CHARACTER SET utf8 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `permission`
--

INSERT INTO `permission` (`ID`, `name`, `properties`) VALUES
(1, 'Администратор', '{\"menu\":\"\",\"tags\":\"guard admin\"}'),
(2, 'Менеджер', '{\"menu\":\"calculator,orders\"}');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `ID` int(10) UNSIGNED NOT NULL,
  `permission_id` int(10) UNSIGNED NOT NULL,
  `login` varchar(100) CHARACTER SET utf8 NOT NULL,
  `password` varchar(60) CHARACTER SET utf8 NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `contacts` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `register_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `activity` int(1) NOT NULL DEFAULT 1,
  `customization` varchar(1000) CHARACTER SET utf8 DEFAULT '{}',
  `hash` varchar(60) CHARACTER SET utf8 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`ID`, `permission_id`, `login`, `password`, `name`, `contacts`, `register_date`, `activity`, `customization`, `hash`) VALUES
(1, 1, 'admin', '$2y$10$BB2.m8vnYM7LCod4FQnHhuF3KSW5rJycwJIznvenAfJSsQsuP3hfS', 'Админ', '{\"64660\":5,\"71610\":5,\"permissionId\":\"3\",\"phone\":\"\",\"email\":\"\",\"activity\":\"on\"}', '2020-07-28 21:00:00', 1, '{}', '$2y$10$Qk8mMRsCrBmVBbyROARRLO4nSr3q8YdLr6vHA35CZfRREhz/h.zz.');

-- --------------------------------------------------------

--
-- Структура таблицы `files`
--

CREATE TABLE `files` (
  `ID` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) DEFAULT 'noName',
  `path` varchar(255) NOT NULL,
  `format` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `files`
--

INSERT INTO `files` (`ID`, `name`, `path`, `format`) VALUES
    (1, 'file', 'file.jpg', 'jpg');

-- --------------------------------------------------------

--
-- Структура таблицы `dealers`
--

CREATE TABLE `dealers` (
  `ID` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `contacts` varchar(255) CHARACTER SET utf8 DEFAULT '{}',
  `register_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_edit_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `activity` int(1) NOT NULL DEFAULT 1,
  `settings` varchar(1000) CHARACTER SET utf8 DEFAULT '{}'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `money`
--
ALTER TABLE `money`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status_id` (`status_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Индексы таблицы `order_status`
--
ALTER TABLE `order_status`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `permission_name_uindex` (`name`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Индексы таблицы `files`
--
ALTER TABLE `files`
    ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `dealers`
--
ALTER TABLE `dealers`
    ADD PRIMARY KEY (`ID`);


--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `customers`
--
ALTER TABLE `customers`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT для таблицы `money`
--
ALTER TABLE `money`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `order_status`
--
ALTER TABLE `order_status`
  MODIFY `ID` int(2) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `permission`
--
ALTER TABLE `permission`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `files`
--
ALTER TABLE `files`
    MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `dealers`
--
ALTER TABLE `dealers`
    MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;


--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`ID`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `order_status` (`ID`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`ID`);

--
-- Ограничения внешнего ключа таблицы `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`ID`);
COMMIT;

