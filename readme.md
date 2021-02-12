Ядро CMS
git submodule update --remote

константы:
 OUTSIDE = false - по умолчанию
 OUTSIDE = true - возврат страницы в json с кучей параметров. Обращаться к index.php
 OUTSIDE = 'S'  - возврат страницы в виде строки
 
 
 вывод калькулятора инлайн используя php.
 <?= require './calc/outside.php'; ?>
