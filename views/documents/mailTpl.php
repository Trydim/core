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
<br>КП №<?= '1 от 2020' ?>
Уточнить содержимое письма.
<?php
// Photo in body
/*	if(isset($_POST['img']) && strlen($_POST['img'])) $resource = createImg(json_decode($_POST['img']));

$imgnode = '';
for($i = 1; $i <= count($resource); $i++) {
	$imgnode .= "<img src='cid:pict$i.jpg'>";
}*/
?>
<!--<table  width="100%" style="border-collapse: collapse;">
  <tbody>
  <?php /*foreach ($data as $key => $list) {
    if($key === 'custom') continue;
    foreach ($list as $rows) { */?>
    <tr>
      <td><?/*= $rows['name'] */?></td>
      <td><?/*= $rows['mName'] */?></td>
      <td><?/*= $rows['value'] */?></td>
      <td><?/*= $rows['coeff'] */?></td>
      <td><?/*= $rows['total'] */?></td>
    </tr>
  <?php /*} } */?>
  </tbody>
</table>
<h2>таблица 2</h2>
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


<video preload=""></video>
