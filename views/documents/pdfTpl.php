<?php
$listData = $this->data['report'];
$global = $this->data['global'];
$listTotal = $this->data['subList'];
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title></title>
</head>
<body>
	<div class="wrapper">
		<header>
			<table border="0" cellpadding="0" cellspacing="0">
				<tbody>
					<tr>
						<td>
							<img src="<?= $this->imgPath ?>masterovit-logo.jpg" alt="logo">
						</td>
						<td style="text-align: right; font-size: 15px; width:30%; vertical-align: middle">
							<u>тел. +7 (499) 450-64-66</u>
							<span style="font-size: 14px">www.masterovit.ru</span>
						</td>
					</tr>
				</tbody>
			</table>
		</header>
    <? if ($global['cpNumber']) { ?>
		<h3>Ваш индивидуальный номер расчёта: <?= $global['cpNumber'] ?></h3>
    <? } ?>
		<h4>Исходные данные:</h4>
    <table  border="1" cellpadding="0" cellspacing="0">
      <tbody>
      <?php foreach ($listData['input'] as $rows) { ?>
          <tr>
            <td style="width: 25%;"><?= $rows[0] ?></td>
            <td style="width: 25%;"><?= $rows[1] ?></td>
          </tr>
      <?php } ?>
      </tbody>
    </table>
    <h4>Смета навеса:</h4>
		<table border="1" cellpadding="0" cellspacing="0">
			<thead>
				<tr>
					<th>№</th>
					<th>Наименование</th>
					<th>Материал</th>
					<th>Ед.изм.</th>
					<th>Кол-во</th>
					<th>Цена</th>
					<th>Сумма</th>
				</tr>
			</thead>
			<tbody>
				<?php $i = 0;
          foreach ($listData as $key => $list) {
					if (!in_array($key, ['base', 'paint'])) continue;
					foreach ($list as $rows) { ?>
						<tr>
							<td style="width: 5%;"><?= $i += 1 ?></td>
              <td style="width: 25%;"><?= $rows['name'] ?></td>
							<td style="width: 25%;"><?= $rows['mName'] ?></td>
							<td style="width: 10%;"><?= $rows['unit'] ?></td>
							<td style="width: 10%;"><?= $rows['count'] ?></td>
							<td style="width: 10%;"><?= $rows['value'] ?></td>
							<td style="width: 15%;"><?= $this->setNumFormat($rows['total']) ?></td>
						</tr>
				<?php }
				} ?>
			</tbody>
			<tfoot>
				<tr>
					<td colspan="5">СТОИМОСТЬ МАТЕРИАЛОВ:</td>
          <?php $total = $listTotal['base']['sTotal'] + $listTotal['paint']['sTotal'] ?>
					<td colspan="2" style="text-align: center;"><?= $this->setNumFormat($total) ?> руб.</td>
				</tr>
			</tfoot>
		</table>
		<h4>Расчет стоимости работ:</h4>
		<table border="1" cellpadding="0" cellspacing="0">
			<thead>
				<tr>
					<th>№</th>
					<th>Наименование</th>
					<th>Ед.изм.</th>
					<th>Кол-во</th>
					<th>Цена</th>
					<th>Сумма</th>
				</tr>
			</thead>
			<tbody>
				<?php $installName = '';
          foreach ($listData['install'] as $rows) { $installName = $rows['mName']; $total += $rows['total']; } ?>
        <tr>
          <td style="width: 5%;">1</td>
          <td style="width: 35%;">Монтаж <?= $installName ?></td>
          <td style="width: 5%;">услуга</td>
          <td style="width: 5%;"><?= $this->setNumFormat($rows['total']) ?></td>
          <td style="width: 15%;"><?= $this->setNumFormat($rows['total']) ?></td>
          <td style="width: 15%;"><?= $this->setNumFormat($rows['total']) ?></td>
        </tr>
			</tbody>
			<tfoot>
				<tr>
					<td colspan="4">СТОИМОСТЬ МОНТАЖА:</td>
          <td colspan="2" style="text-align: center;"><?= $this->setNumFormat($listTotal['install']['sTotal']) ?> руб.</td>
				</tr>
			</tfoot>
		</table>
		<h4>Доставка: </h4>
		<table border="1" cellpadding="0" cellspacing="0">
			<thead>
				<tr>
					<th>№</th>
					<th>Наименование</th>
					<th>Ед.изм.</th>
					<th>Кол-во</th>
					<th>Цена</th>
					<th>Сумма</th>
				</tr>
			</thead>
			<tbody>
        <?php foreach ($listData['delivery'] as $key => $rows) { $total += $rows['total']; ?>
          <tr>
            <td style="width: 5%;"><?= $key + 1 ?></td>
            <td style="width: 35%;">Доставка<!--?= $rows['mName'] ?--></td>
            <td style="width: 5%;"><?= $rows['unit'] ?></td>
            <td style="width: 5%;"><?= $rows['count'] ?></td>
            <td style="width: 15%;"><?= $rows['value'] ?></td>
            <td style="width: 15%;"><?= $this->setNumFormat($rows['total']) ?></td>
          </tr>
        <?php } ?>
			</tbody>
			<tfoot>
				<tr>
					<td colspan="4">СТОИМОСТЬ ДОСТАВКИ:</td>
          <td colspan="2" style="text-align: center;"><?= $this->setNumFormat($listTotal['delivery']['sTotal']) ?> руб.</td>
				</tr>
			</tfoot>
		</table>

		<table class="result-block" border="0" cellpadding="0" cellspacing="0">
			<tbody>
				<tr>
					<td style="text-align: left;  width:70%;">
						ИТОГОВАЯ СТОИМОСТЬ ДОГОВОРА
					</td>
					<td style="text-align: right; width:30%;">
						<u><?= $this->setNumFormat($total) ?> руб.</u>
					</td>
				</tr>
			</tbody>
		</table>
		<h4>Полезная информация: </h4>
		<div class="text">
			Далеко-далеко за словесными горами в стране гласных и согласных живут рыбные тексты.
			Вдали от всех живут они в буквенных домах на берегу Семантика большого языкового океана.
			Маленький ручеек Даль журчит по всей стране и обеспечивает ее всеми необходимыми правилами.
			Эта парадигматическая страна, в которой жаренные члены предложения залетают прямо в рот. Даже всемогущая пунктуация не имеет власти над рыбными текстами,
			ведущими безорфографичный образ жизни. Однажды одна маленькая строчка рыбного текста по имени Lorem ipsum решила выйти в большой мир грамматики.
			Великий Оксмокс предупреждал ее о злых запятых, диких знаках вопроса и коварных точках с запятой, но текст не дал сбить себя с толку.
			Он собрал семь своих заглавных букв, подпоясал инициал за пояс и пустился в дорогу. Взобравшись на первую вершину курсивных гор,
			бросил он последний взгляд назад, на силуэт своего родного города Буквоград, на заголовок деревни Алфавит и на подзаголовок своего переулка Строчка.
			Грустный риторический вопрос скатился по его щеке и он продолжил свой путь. По дороге встретил текст рукопись. Она предупредила его: «В моей стране все переписывается
			по несколько раз. Единственное, что от меня осталось, это приставка «и». Возвращайся ты лучше в свою безопасную страну». Не послушавшись рукописи,
			наш текст продолжил свой путь. Вскоре ему повстречался коварный составитель рекламных текстов, напоивший его языком и речью и заманивший в свое агенство,
			которое использовало его снова и снова в своих проектах. И если его не переписали, то живет он там до сих пор.Далеко-далеко за словесными горами в стране гласных и
			согласных живут рыбные тексты. Вдали от всех живут они в буквенных домах на берегу Семантика большого языкового океана. Маленький ручеек Даль журчит по всей стране и
			обеспечивает ее всеми необходимыми правилами. Эта парадигматическая страна, в которой жаренные члены предложения залетают прямо в рот. Даже всемогущая пунктуация не
			имеет власти над рыбными текстами, ведущими безорфографичный образ жизни. Однажды одна маленькая
			Эта парадигматическая страна, в которой жаренные члены предложения залетают прямо в рот. Даже всемогущая пунктуация не имеет власти над рыбными текстами,
			ведущими безорфографичный образ жизни. Однажды одна маленькая строчка рыбного текста по имени Lorem ipsum решила выйти в большой мир грамматики.
			Великий Оксмокс предупреждал ее о злых запятых, диких знаках вопроса и коварных точках с запятой, но текст не дал сбить себя с толку.
			Он собрал семь своих заглавных букв, подпоясал инициал за пояс и пустился в дорогу. Взобравшись на первую вершину курсивных гор,
			бросил он последний взгляд назад, на силуэт своего родного города Буквоград, на заголовок деревни Алфавит и на подзаголовок своего переулка Строчка.
			Грустный риторический вопрос скатился по его щеке и он продолжил свой путь. По дороге встретил текст рукопись. Она предупредила его: «В моей стране все переписывается
			по несколько раз. Единственное, что от меня осталось, это приставка «и». Возвращайся ты лучше в свою безопасную страну». Не послушавшись рукописи,
			наш текст продолжил свой путь. Вскоре ему повстречался коварный составитель рекламных текстов, напоивший его языком и речью и заманивший в свое агенство,
			бросил он последний взгляд назад, на силуэт своего родного города Буквоград, на заголовок деревни Алфавит и на подзаголовок своего переулка Строчка.
			Грустный риторический вопрос скатился по его щеке и он продолжил свой путь. По дороге встретил текст рукопись. Она предупредила его: «В моей стране все переписывается
			по несколько раз. Единственное, что от меня осталось, это приставка «и». Возвращайся ты лучше в свою безопасную страну». Не послушавшись рукописи
		</div>
		<div class="footer">
			<div  class="footer-item">С уважением,</div>
			<div  class="footer-item">Менеджер по продажам<br><b>ООО "Мастеровит"</b></div>
			<div  class="footer-item">Корпоративный номер телефона</div>
			<div  class="footer-item">Корпоративный номер почта</div>
			<div  class="footer-item">Корпоративный WhatsApp</div>
		</div>
	</div>
</body>

</html>
