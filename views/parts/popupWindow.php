<?php
if (!isset($btn)) $btn = <<<btn
			<input type="button" class="confirmYes btn btn-success" value="Подтвердить" data-action="confirmYes">
			<input type="button" class="closeBtn btn btn-warning" value="Отмена" data-action="confirmNo">
btn;
?>
<div class="modal-overlay" id="modalWrap">
	<div class="modal p-a-20 ">
		<button type="button" class="close-modal">
			<span class="material-icons">clear</span>
		</button>
		<div class="modal-title modalT">Some title here</div>
		<div class="modalC w-100 p-t-20"></div>
		<div class="modal-button modalBtn"><?= $btn ?></div>
	</div>
</div>
