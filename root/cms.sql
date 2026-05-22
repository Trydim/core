-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1:3306
-- Время создания: Июл 27 2021 г., 10:45
-- Версия сервера: 10.4.12-MariaDB
-- Версия PHP: 7.3.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- База данных: `cms`
--

-- --------------------------------------------------------

--
-- Структура таблицы `client_orders`
--

CREATE TABLE `client_orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `dealer_id` int(10) UNSIGNED DEFAULT NULL,
  `create_date` timestamp NULL DEFAULT current_timestamp(),
  `save_value` varchar(500) DEFAULT '{}',
  `important_value` varchar(255) DEFAULT '{}',
  `report_value` mediumblob DEFAULT NULL,
  `total` float DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `client_orders`
--

INSERT INTO `client_orders` (`id`, `dealer_id`, `save_value`, `important_value`, `total`) VALUES
(1, 1, '{}', '{}', 1);

--
-- Структура таблицы `codes`
--

CREATE TABLE `codes` (
  `dealer_id` int(10) UNSIGNED DEFAULT NULL,
  `symbol_code` varchar(255) CHARACTER SET utf8 NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Структура таблицы `customers`
--

CREATE TABLE `customers` (
  `id` int(10) UNSIGNED NOT NULL,
  `dealer_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL DEFAULT 'NoName',
  `ITN` varchar(15) DEFAULT NULL,
  `contacts` varchar(255) DEFAULT '{}'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `customers`
--

INSERT INTO `customers` (`id`, `dealer_id`, `name`, `ITN`, `contacts`) VALUES
(1, 1, 'Петя', '', '{\"phone\":\"+7 (123) 456 78 97\",\"email\":\"as@as.by\",\"address\":\"test\"}');

-- --------------------------------------------------------

--
-- Структура таблицы `files`
--

CREATE TABLE `files` (
  `id` int(10) UNSIGNED NOT NULL,
  `dealer_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(255) DEFAULT 'noName',
  `path` varchar(255) NOT NULL,
  `format` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `files`
--

INSERT INTO `files` (`id`, `dealer_id`, `name`, `path`, `format`) VALUES
(1, 1, 'file', 'file.jpg', 'jpg');

-- --------------------------------------------------------

--
-- Структура таблицы `money`
--

CREATE TABLE `money` (
  `id` int(10) UNSIGNED NOT NULL,
  `dealer_id` int(10) UNSIGNED DEFAULT NULL,
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

INSERT INTO `money` (`id`, `dealer_id`, `code`, `name`, `short_name`, `main`) VALUES
(1, 1, 'USD', 'United State Dollar', '$', 1),
(2, 1, 'RUB', 'Российский рубль', 'руб.', null),
(3, 1, 'BYN', 'Белорусский рубль', 'руб.', null);

-- --------------------------------------------------------

--
-- Структура таблицы `orders`
--

CREATE TABLE `orders` (
  `id` int(10) UNSIGNED NOT NULL,
  `dealer_id` int(10) UNSIGNED NOT NULL,
  `create_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_edit_date` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
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
-- Структура таблицы `order_search_index`
--

CREATE TABLE `order_search_index` (
  `order_id` int(10) UNSIGNED NOT NULL,
  `search_content` text NOT NULL,
  PRIMARY KEY (`order_id`),
  FULLTEXT KEY `idx_search` (`search_content`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Структура таблицы `order_status`
--

CREATE TABLE `order_status` (
  `id` int(2) UNSIGNED NOT NULL,
  `dealer_id` int(10) UNSIGNED DEFAULT NULL,
  `code` varchar(50) NULL DEFAULT NULL,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL,
  `sort` int(4) DEFAULT 50 NULL,
  `required` int(1) DEFAULT 0 NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `order_status`
--

INSERT INTO `order_status` (`id`, `dealer_id`, `name`) VALUES
(1, 1, 'Заказ оформлен'),
(2, 1, 'Заказ оплачен');

-- --------------------------------------------------------

--
-- Структура таблицы `permission`
--

CREATE TABLE `permission` (
  `id` int(10) UNSIGNED NOT NULL,
  `dealer_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(50) CHARACTER SET utf8 NOT NULL,
  `properties` varchar(255) CHARACTER SET utf8 NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `permission`
--

INSERT INTO `permission` (`id`, `dealer_id`, `name`, `properties`) VALUES
(1, 1, 'Администратор', '{\"menu\":\"\",\"tags\":\"guard admin\"}'),
(2, 1, 'Менеджер', '{\"menu\":\"calculator,orders\"}');

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `dealer_id` int(10) UNSIGNED NOT NULL,
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

INSERT INTO `users` (`id`, `dealer_id`, `permission_id`, `login`, `password`, `name`) VALUES
(1, 1, 1, 'admin', '$2y$10$BB2.m8vnYM7LCod4FQnHhuF3KSW5rJycwJIznvenAfJSsQsuP3hfS', 'admin');

-- --------------------------------------------------------

--
-- Структура таблицы `root_users`
--

CREATE TABLE `root_users` (
  `id` int(10) UNSIGNED NOT NULL,
  `login` varchar(100) CHARACTER SET utf8 NOT NULL,
  `password` varchar(60) CHARACTER SET utf8 NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `contacts` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `register_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `activity` int(1) NOT NULL DEFAULT 1,
  `customization` varchar(1000) CHARACTER SET utf8 DEFAULT '{}',
  `hash` varchar(60) CHARACTER SET utf8 DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Структура таблицы `dealers`
--

CREATE TABLE `dealers` (
  `id` int(10) UNSIGNED NOT NULL,
  `cms_param` varchar(255) CHARACTER SET utf8 DEFAULT '{}',
  `name` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `contacts` varchar(255) CHARACTER SET utf8 DEFAULT '{}',
  `register_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_edit_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `activity` int(1) NOT NULL DEFAULT 1,
  `settings` mediumblob DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Дамп данных таблицы `dealers`
--

INSERT INTO `dealers` (`id`, `cms_param`, `name`, `contacts`, `activity`) VALUES
(1, '{\"urlPrefix\":\"default\",\"prefix\":\"\"}', 'Default dealer', '{}', 1);

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `client_orders`
--
ALTER TABLE `client_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_orders_dealer_id_idx` (`dealer_id`);

--
-- Индексы таблицы `codes`
--
ALTER TABLE `codes`
  ADD PRIMARY KEY (`symbol_code`),
  ADD UNIQUE KEY `codes_dealer_symbol_code_uindex` (`dealer_id`,`symbol_code`),
  ADD KEY `codes_dealer_id_idx` (`dealer_id`);

--
-- Индексы таблицы `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customers_dealer_id_idx` (`dealer_id`);

--
-- Индексы таблицы `files`
--
ALTER TABLE `files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `files_dealer_id_idx` (`dealer_id`);

--
-- Индексы таблицы `money`
--
ALTER TABLE `money`
  ADD PRIMARY KEY (`id`),
  ADD KEY `money_dealer_id_idx` (`dealer_id`);

--
-- Индексы таблицы `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orders_dealer_id_idx` (`dealer_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `status_id` (`status_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Индексы таблицы `order_status`
--
ALTER TABLE `order_status`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_status_dealer_id_idx` (`dealer_id`);

--
-- Индексы таблицы `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permission_dealer_name_uindex` (`dealer_id`,`name`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `users_dealer_id_idx` (`dealer_id`),
  ADD KEY `permission_id` (`permission_id`);

--
-- Индексы таблицы `root_users`
--
ALTER TABLE `root_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `root_users_login_uindex` (`login`);

--
-- Индексы таблицы `dealers`
--
ALTER TABLE `dealers`
    ADD PRIMARY KEY (`id`);


--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `client_orders`
--
ALTER TABLE `client_orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `files`
--
ALTER TABLE `files`
    MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `money`
--
ALTER TABLE `money`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `order_status`
--
ALTER TABLE `order_status`
  MODIFY `id` int(2) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `permission`
--
ALTER TABLE `permission`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `root_users`
--
ALTER TABLE `root_users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `dealers`
--
ALTER TABLE `dealers`
    MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Ограничения внешнего ключа сохраненных таблиц
--

--
-- Ограничения внешнего ключа таблицы `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_dealer_fk` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`),
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`status_id`) REFERENCES `order_status` (`id`),
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`);

--
-- Ограничения внешнего ключа таблицы `order_search_index`
--
ALTER TABLE `order_search_index`
  ADD CONSTRAINT `order_search_index_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Ограничения внешнего ключа таблицы `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_dealer_fk` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`),
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`);

--
-- Ограничения внешнего ключа таблицы `client_orders`
--
ALTER TABLE `client_orders`
  ADD CONSTRAINT `client_orders_dealer_fk` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`);

--
-- Ограничения внешнего ключа таблицы `codes`
--
ALTER TABLE `codes`
  ADD CONSTRAINT `codes_dealer_fk` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`);

--
-- Ограничения внешнего ключа таблицы `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_dealer_fk` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`);

--
-- Ограничения внешнего ключа таблицы `files`
--
ALTER TABLE `files`
  ADD CONSTRAINT `files_dealer_fk` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`);

--
-- Ограничения внешнего ключа таблицы `money`
--
ALTER TABLE `money`
  ADD CONSTRAINT `money_dealer_fk` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`);

--
-- Ограничения внешнего ключа таблицы `order_status`
--
ALTER TABLE `order_status`
  ADD CONSTRAINT `order_status_dealer_fk` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`);

--
-- Ограничения внешнего ключа таблицы `permission`
--
ALTER TABLE `permission`
  ADD CONSTRAINT `permission_dealer_fk` FOREIGN KEY (`dealer_id`) REFERENCES `dealers` (`id`);
COMMIT;

