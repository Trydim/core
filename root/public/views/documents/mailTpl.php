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

<table style="border-collapse: collapse;">
  <tbody>
  <?php /*foreach ($data['custom'] as $rows) { */?>
      <tr>
        <td><?/*= $rows[0] */?></td>
      </tr>
    <?php /*} */?>
  </tbody>
</table>-->
