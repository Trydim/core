<?php if ( !defined('MAIN_ACCESS')) die('access denied!');

/**
 * @var object $main
 * @var array $param
 */

$field['content'] = template('parts/customersContent', $param);

$field['footerContent'] = <<<footerContent
<template id="tableOrderBtn">
  <input type="button" class="btn btn-info btn-sm table-th" value="Посмотреть заказы" data-id="\${id}" data-action="openOrders">
</template>
<template id="tableOrdersNumbers">
  <div class="form-check mb-1">
    <input class="form-check-input" type="radio" name="orders" id="orders-\${value}">
    <label class="form-check-label" for="orders-\${value}">Заказ №\${value}</label>
  </div>
</template>
<template id="tableContactsValue">
  <div>\${key}: \${value}</div>
</template>
<template id="customerForm">
  <form class="was-validated" action="#">
  
    <div class="form-floating my-3">
      <input type="text" class="form-control" id="cName" placeholder="Имя" name="name" value="">
      <label for="cName">Имя</label>
    </div>
    
    <div class="form-floating mb-3">
      <input type="tel" class="form-control" id="cPhone" placeholder="Телефон" name="phone" value="">
      <label for="cPhone">Телефон</label>
    </div>
 
    <div class="form-floating mb-3">
      <input type="email" class="form-control" id="cMail" placeholder="Почта" name="email" value="">
      <label for="cMail">Почта</label>
    </div>
    
    <div class="row mb-3">
      <div class="col">
        <div class="form-check">
          <input class="form-check-input" type="radio" name="cType" value="i" id="cTypeI" data-target="customerTypeI">
          <label class="form-check-label" for="cTypeI">Физ.лицо</label>
        </div>
      </div>
      <div class="col">
        <div class="form-check">
          <input class="form-check-input" type="radio" name="cType" value="b" id="cTypeB" data-target="customerTypeB">
          <label class="form-check-label" for="cTypeB">Юр.лицо</label>
        </div>
      </div>
    </div>
    
    <div class="form-floating mb-3">
      <input type="text" class="form-control" id="address" placeholder="Адрес" name="address" value="">
      <label for="address">Адрес</label>
    </div>
    
    <div class="form-floating mb-3" data-relation="customerTypeB && !customerTypeI">
      <input type="text" class="form-control" id="ITN" placeholder="ИНН" name="ITN" value="">
      <label for="ITN">ИНН</label>
    </div>
  </form>
</template>
<template id="noFoundSearchMsg">
  <tr><td colspan="15">не найдено</td></tr>
</template>
footerContent;

$field['footerContent'] .= '<a id="publicPageLink" href="' . PUBLIC_PAGE . '" hidden></a>';
$field['footerContent'] .= $main->initDictionary();
