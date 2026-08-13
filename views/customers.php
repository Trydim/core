<?php if (!defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var Main $main - global
 * @var array $param - from c_customers.php
 */

$main->addControllerField(VC::BASE_CONTENT, template('parts/customersContent', $param));

ob_start(); ?>
<template id="tableOrderBtn">
  <input type="button" class="btn btn-info btn-sm table-th" value="<?= gTxt('Show orders') ?>" data-id="${id}" data-action="openOrders">
</template>
<template id="tableOrdersNumbers">
  <div class="form-check mb-1">
    <input class="form-check-input" type="radio" name="orders" id="orders-${value}" value="${value}">
    <label class="form-check-label" for="orders-${value}"><?= gTxt('Order') ?> №${value}</label>
  </div>
</template>
<template id="tableContactsValue">
  <div>${key}: ${value}</div>
</template>
<template id="customerForm">
  <form class="was-validated" action="#">
    <div class="form-floating my-3">
      <input type="text" class="form-control" id="cName" placeholder="<?= gTxt('Name') ?>" name="name">
      <label for="cName"><?= gTxt('Name') ?></label>
    </div>
    
    <div class="form-floating mb-3">
      <input type="tel" class="form-control" id="cPhone" placeholder="<?= gTxt('Phone') ?>" name="phone">
      <label for="cPhone"><?= gTxt('Phone') ?></label>
    </div>
 
    <div class="form-floating mb-3">
      <input type="email" class="form-control" id="cMail" placeholder="<?= gTxt('Mail') ?>" name="email">
      <label for="cMail"><?= gTxt('Mail') ?></label>
    </div>
    
    <div class="row mb-3">
      <div class="col">
        <div class="form-check">
          <input class="form-check-input" type="radio" name="cType" value="i" id="cTypeI" data-target="customerTypeI">
          <label class="form-check-label" for="cTypeI"><?= gTxt('Individual') ?></label>
        </div>
      </div>
      <div class="col">
        <div class="form-check">
          <input class="form-check-input" type="radio" name="cType" value="b" id="cTypeB" data-target="customerTypeB">
          <label class="form-check-label" for="cTypeB"><?= gTxt('Corporate') ?></label>
        </div>
      </div>
    </div>
    
    <div class="form-floating mb-3">
      <input type="text" class="form-control" id="address" placeholder="<?= gTxt('Address') ?>" name="address" value="">
      <label for="address"><?= gTxt('Address') ?></label>
    </div>
    
    <div class="form-floating mb-3" data-relation="customerTypeB && !customerTypeI">
      <input type="text" class="form-control" id="tin" placeholder="<?= gTxt('TIN') ?>" name="tin" value="">
      <label for="tin"><?= gTxt('TIN') ?></label>
    </div>
  </form>
</template>
<template id="noFoundSearchMsg">
  <tr><td colspan="15"><?= gTxt('not found') ?></td></tr>
</template>
<?php $main->addControllerField(VC::BASE_FOOTER_CONTENT, ob_get_clean());

$main->addControllerField(
  VC::BASE_FOOTER_CONTENT,
  '<a id="publicPageLink" href="' . $main->url->getPath() . '" hidden></a>'
);
$main->addControllerField(VC::BASE_FOOTER_CONTENT, $main->initDictionary());
