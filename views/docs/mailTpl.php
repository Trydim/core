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

<table  width="100%" style="border-collapse: collapse;">
  <tbody>
  <?php /*foreach ($data['custom'] as $rows) { */?>
      <tr>
        <td><?/*= $rows[0] */?></td>
        <td><?/*= $rows[1] */?></td>
        <td><?/*= $rows[2] */?></td>
        <td><?/*= $rows[3] */?></td>
      </tr>
    <?php /*} */?>
  </tbody>
</table>-->
