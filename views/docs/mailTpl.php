<?php
!isset($data) && $data = [];
$data = $data['report'];
$name = htmlspecialchars($name);
$phone = htmlspecialchars($phone);
$email = htmlspecialchars($email);
?>
<br><b>Имя:</b><?= $name ?>
<br><b>Контактный телефон:</b><?= $phone ?>
<br><b>Email:</b><?= $email ?>

Шаблон CMS.
