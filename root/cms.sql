-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Июн 16 2021 г., 10:56
-- Версия сервера: 10.4.12-MariaDB
-- Версия PHP: 7.3.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `cms`
--

-- --------------------------------------------------------

--
-- Структура таблицы `codes`
--

CREATE TABLE `codes` (
  `symbol_code` varchar(255) CHARACTER SET utf8 NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `codes`
--

INSERT INTO `codes` (`symbol_code`, `name`) VALUES
('door', 'дверь'),
('stone', 'камень');

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
(1, 'customers', NULL, '{}');

-- --------------------------------------------------------

--
-- Структура таблицы `elements`
--

CREATE TABLE `elements` (
  `ID` int(10) UNSIGNED NOT NULL,
  `element_type_code` varchar(255) CHARACTER SET utf8 NOT NULL,
  `section_parent_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT 'noname',
  `last_edit_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `activity` int(1) NOT NULL DEFAULT 1,
  `sort` int(11) NOT NULL DEFAULT 100
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `elements`
--

INSERT INTO `elements` (`ID`, `element_type_code`, `section_parent_id`, `name`, `last_edit_date`, `activity`, `sort`) VALUES
(2, 'stone', 2, 'Камень1', '2021-06-14 07:25:40', 1, 100);

--
-- Триггеры `elements`
--
DELIMITER $$
CREATE TRIGGER `InsertElement` AFTER INSERT ON `elements` FOR EACH ROW INSERT INTO options_elements (element_id, name)
VALUES (NEW.ID, NEW.name)
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Структура таблицы `files`
--

CREATE TABLE `files` (
  `ID` int(10) UNSIGNED NOT NULL,
  `Name` varchar(255) DEFAULT 'noName',
  `Path` varchar(255) NOT NULL,
  `Format` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `files`
--

INSERT INTO `files` (`ID`, `Name`, `Path`, `Format`) VALUES
(1, 'image.jpg', 'image.jpg', 'jpg');

-- --------------------------------------------------------

--
-- Структура таблицы `money`
--

CREATE TABLE `money` (
  `ID` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) CHARACTER SET utf8 NOT NULL,
  `short_name` varchar(5) CHARACTER SET utf8 NOT NULL,
  `rate` decimal(10,4) NOT NULL DEFAULT 1.0000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `money`
--

INSERT INTO `money` (`ID`, `name`, `short_name`, `rate`) VALUES
(1, 'United State Dollar', '$', '1.0000');

-- --------------------------------------------------------

--
-- Структура таблицы `options_elements`
--

CREATE TABLE `options_elements` (
  `ID` int(10) UNSIGNED NOT NULL,
  `element_id` int(10) UNSIGNED NOT NULL,
  `money_input_id` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `money_output_id` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `unit_id` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `images_ids` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `name` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT 'not name option',
  `properties` varchar(1000) CHARACTER SET utf8 DEFAULT NULL,
  `last_edit_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `activity` int(1) NOT NULL DEFAULT 1,
  `sort` int(10) NOT NULL DEFAULT 100,
  `input_price` decimal(10,4) NOT NULL DEFAULT 1.0000,
  `output_percent` double NOT NULL DEFAULT 1,
  `output_price` decimal(10,4) NOT NULL DEFAULT 1.0000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Варианты элементов';

--
-- Дамп данных таблицы `options_elements`
--

INSERT INTO `options_elements` (`ID`, `element_id`, `money_input_id`, `money_output_id`, `unit_id`, `images_ids`, `name`, `properties`, `last_edit_date`, `activity`, `sort`, `input_price`, `output_percent`, `output_price`) VALUES
(1, 2, 1, 1, 1, '1,1', 'Камень1', '{\"prop_brand\":\"1\"}', '2021-06-16 07:51:05', 1, 100, '1.0000', 1, '1.0000'),
(2, 2, 1, 1, 1, '', 'Камень2', NULL, '2021-06-16 06:54:48', 1, 100, '1.0000', 1, '1.0000');

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE `orders` (
  `ID` int(10) UNSIGNED NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_edit_date` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `customer_id` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `total` float DEFAULT 0,
  `important_value` varchar(255) CHARACTER SET utf8 NOT NULL DEFAULT '{}',
  `status_id` int(2) UNSIGNED NOT NULL DEFAULT 1,
  `save_value` varchar(500) CHARACTER SET utf8 NOT NULL DEFAULT '{}',
  `report_value` varbinary(2000) DEFAULT NULL
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
(1, 'Заказ оформлен');

-- --------------------------------------------------------

--
-- Структура таблицы `permission`
--

CREATE TABLE `permission` (
  `ID` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL,
  `access_val` varchar(255) CHARACTER SET utf8 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `permission`
--

INSERT INTO `permission` (`ID`, `name`, `access_val`) VALUES
(1, 'admin', '{\"menuAccess\":\"\"}');

-- --------------------------------------------------------

--
-- Структура таблицы `prop_brand`
--

CREATE TABLE `prop_brand` (
  `ID` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'NoName',
  `logo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `prop_brand`
--

INSERT INTO `prop_brand` (`ID`, `name`, `logo`) VALUES
(1, 'brand1', 'image.png'),
(2, 'brand2', 'image.png'),
(3, 'brand3', 'image.png');

-- --------------------------------------------------------

--
-- Структура таблицы `section`
--

CREATE TABLE `section` (
  `ID` int(10) UNSIGNED NOT NULL,
  `parent_ID` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `code` varchar(255) CHARACTER SET utf8 NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 NOT NULL,
  `active` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `section`
--

INSERT INTO `section` (`ID`, `parent_ID`, `code`, `name`, `active`) VALUES
(1, 0, 'root', 'камни', 1),
(2, 1, 'dir1', 'красные', 1),
(3, 1, 'dir2', 'синие', 1),
(4, 0, 'dir3', 'дерево', 1),
(5, 4, 'dir4', 'елки', 1),
(6, 4, 'dir5', 'дубы', 1),
(7, 5, 'dir6', 'искусственные', 1),
(8, 5, 'dir6', 'натуральные', 1),
(9, 0, 'sheep', 'овцы', 1);

-- --------------------------------------------------------

--
-- Структура таблицы `units`
--

CREATE TABLE `units` (
  `ID` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 NOT NULL,
  `short_name` varchar(10) CHARACTER SET utf8 NOT NULL,
  `activity` int(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `units`
--

INSERT INTO `units` (`ID`, `name`, `short_name`, `activity`) VALUES
(1, 'Штука', 'шт.', 1),
(2, 'Метр погонный', 'м.п.', 1);

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
(1, 1, 'admin', '$2y$10$BB2.m8vnYM7LCod4FQnHhuF3KSW5rJycwJIznvenAfJSsQsuP3hfS', 'admin', '{}', '2020-07-28 21:00:00', 1, '{}', '$2y$10$vXkh.0PCabVi9LWWiDtLX.5nlh2q71V6pCyootZYt1RbF6rRiGyra');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `codes`
--
ALTER TABLE `codes`
  ADD PRIMARY KEY (`symbol_code`),
  ADD UNIQUE KEY `codes_symbol_code_uindex` (`symbol_code`);

--
-- Индексы таблицы `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `elements`
--
ALTER TABLE `elements`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `section_parent_id` (`section_parent_id`),
  ADD KEY `element_type_id` (`element_type_code`);

--
-- Индексы таблицы `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `money`
--
ALTER TABLE `money`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `options_elements`
--
ALTER TABLE `options_elements`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `element_id` (`element_id`),
  ADD KEY `money_id` (`money_input_id`),
  ADD KEY `unit_id` (`unit_id`),
  ADD KEY `money_output_id` (`money_output_id`);

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
-- Индексы таблицы `prop_brand`
--
ALTER TABLE `prop_brand`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `section`
--
ALTER TABLE `section`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `parent_ID` (`parent_ID`);

--
-- Индексы таблицы `units`
--
ALTER TABLE `units`
  ADD PRIMARY KEY (`ID`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `permission_id` (`permission_id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `customers`
--
ALTER TABLE `customers`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `elements`
--
ALTER TABLE `elements`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `files`
--
ALTER TABLE `files`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `money`
--
ALTER TABLE `money`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `options_elements`
--
ALTER TABLE `options_elements`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `order_status`
--
ALTER TABLE `order_status`
  MODIFY `ID` int(2) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `permission`
--
ALTER TABLE `permission`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT для таблицы `prop_brand`
--
ALTER TABLE `prop_brand`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT для таблицы `section`
--
ALTER TABLE `section`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT для таблицы `units`
--
ALTER TABLE `units`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `ID` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `elements`
--
ALTER TABLE `elements`
  ADD CONSTRAINT `elements_ibfk_3` FOREIGN KEY (`element_type_code`) REFERENCES `codes` (`symbol_code`),
  ADD CONSTRAINT `elements_ibfk_4` FOREIGN KEY (`section_parent_id`) REFERENCES `section` (`ID`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `options_elements`
--
ALTER TABLE `options_elements`
  ADD CONSTRAINT `options_elements_ibfk_1` FOREIGN KEY (`element_id`) REFERENCES `elements` (`ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `options_elements_ibfk_2` FOREIGN KEY (`unit_id`) REFERENCES `units` (`ID`),
  ADD CONSTRAINT `options_elements_ibfk_3` FOREIGN KEY (`money_input_id`) REFERENCES `money` (`ID`),
  ADD CONSTRAINT `options_elements_ibfk_4` FOREIGN KEY (`money_output_id`) REFERENCES `money` (`ID`);

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

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
