<?php ?>
<div class="text-center flex-footer footer" id="footerBlock">
  <button type="button" class="btn-arrow"  data-action="new">&laquo;</button>
  <div id="onePageBtn" class="flex-footer"></div>
  <button type="button" class="btn-arrow" data-action="old">&raquo;</button>
  <select class="select-width custom-select" data-action="count">
    <option value="1">1 запись</option>
    <option value="2">2 записи</option>
    <option value="5">5 записей</option>
    <option value="20" selected>20 записей</option>
  </select>
</div>
<template id="onePageInput">
  <input type="button" value="${pageValue}" class="ml-1 mr-1 input-paginator" data-action="page" data-page="${page}">
</template>
