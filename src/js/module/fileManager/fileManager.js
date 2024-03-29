"use strict";

import '../../../css/module/fileManager/fileManager.css';

const t = dir => {
  //$body.append('<div id="alerts" class="btn blue">загрузка..</div>');
  //$("#alerts").fadeIn(1e3);
  fileManager.query({cmsAction: 'showTable', dir}, (data) => {
    $('#ab-container-table').html('').append(data);
    //$("#alerts").hide().remove();
  });
}

const fileManager = {
  form: new FormData(),

  queryParam: {
    mode: 'FM',
    cmsAction: 'showTable',
  },

  init() {
    let $body = $("body"),
        node = f.qS('#rootDirData'),
        root = node && node.value || 'public';
    t(root);

    $("div.fo").next().hide(1, () => {
      $("#tree").css("display", "block")
    });

    $body.on("click", "#tree div.fo", function () {
      $(this).next().toggle(100);
      $(".selected").removeClass("selected");
      const i = $(this).data("fo");
      t(i);
      $("#breadcrumb-links span").text(i);
      $(this).hasClass("closed") ? $(this).removeClass("closed").addClass("open selected") : $(this).removeClass("open").addClass("closed selected")
    });
    $body.on("click", "#tree #home", function () {
      $("div.fo.open").next().hide(100).removeClass("open").addClass("closed");
      $(".selected").removeClass("selected");
      const i = $(this).data("fo");
      t(i);
      $("#breadcrumb-links span").text(i);
      $(this).addClass("selected")
    });
    $body.on("click", "td.ab-tdfolder a", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const href = this.href,
            folder = href.match(/([^\/]*)\/*$/)[1],
            u = $("div.selected").next().find("#" + folder),
            ulNode = u.parents("ul"),
            div = ulNode.prev("div");

      $("#tree div.selected")[0].dataset.fo += folder + '/';

      //t(href);
      u.parents("ul:hidden");
      ulNode.css("display", "block");
      div.removeClass("closed").addClass("open selected");
      //scroll = 1;
      u.click();
    });
    $body.on("mouseenter", ".zoom", function (t) {
      t.preventDefault();
      $body.append('<div id="imgpreview" style="background-color:#ddd;width:120px;position:fixed;z-index:9999;left:' + parseInt(t.clientX - 140) + "px;top:" + parseInt(t.clientY - 40) + 'px"><img src="' + $(this).attr("href") + '" width="120" height="120"></div>')
    });
    $body.on("mouseleave", ".zoom", () => {$("#imgpreview").hide().remove()});
    $body.on("click", "#createFolder", e => {
      let path = $("#tree div.selected").data("fo"),
          folder = prompt("Название директории:", ""), dir;

      e.preventDefault();
      if (folder) {
        dir = path + folder + "/";

        $body.append('<div id="alerts" class="btn blue">working..<\/div>');

        this.query({cmsAction: 'createFolder', dir}, () => {
          $("#tree div.selected")
            .next("ul")
            .append(`<li><div id="${folder}" data-fo="${dir}" class="fo closed">${folder}</div><ul style="display: none;"></ul></li>`);
          t(path)
        });
      }
    });
    // Создать файл
    $body.on("click", "#createFile", function (i) {
      const u = $("#tree div.selected").data("fo"),
            r = prompt("Name file:", "");

      i.preventDefault();

      if (r) {
        fileManager.query({cmsAction: 'createFile', fileName: u + r}, function () {
          t(u);
          let ext = r.substr(r.lastIndexOf(".") + 1);
          $("#tree div.selected").next("ul")
                                 .append('<li class="ext-file ext-' + ext + '" style="border-right:1px solid red">' + r + "<\/li>")
        })
      } else {
        f.showMsg('File name error', 'error');
      }
    });
    $body.on("click", ".renamefolder", function (t) {
      t.preventDefault();
      var f = $(this).parents("tr").find("a.delete-directory").attr("href"),
          r = f.match(/([^\/]*)\/*$/)[1],
          i = prompt("New name:", r);

      if (i != null && i !== "") {
        //$body.append('<div id="alerts" class="btn blue">working..<\/div>');
        var u = f.replace(r, i),
            e = $("#ab-list-pages td.ab-tdfolder").find("a:contains(" + r + "):last"),
            o = $(".selected").next("ul").find("li div:contains(" + r + "):last"),
            s = $(this).parents("tr").find("a.delete-directory");

        fileManager.query({cmsAction: 'renameFolder', oldName: f, newName: u}, function () {
          //$body.append('<div id="alerts" class="btn blue">' + t + "<\/div>");
          e.attr("href", u).text(i);
          s.attr("href", u);
          o.attr("id", i).attr("data-fo", u).text(i)
        })
      }
    });
    $body.on("click", ".renamefile", function (t) {
      t.preventDefault();
      var u = $(this).parents("tr").find("a.delete-file").attr("href"),
          r = u.match(/([^\/]*)\/*$/)[1],
          i = prompt("New name:", r),
          e = $(this).parents("tr").find("a.delete-file"),
          o = $(this).parents("tr").find("a.ab-edit-file");

      if (i != null && i !== "") {
        //$body.append('<div id="alerts" class="btn blue">working..<\/div>');
        $("#alerts").fadeIn(1e3);
        var f = u.replace(r, i),
            s = $("#ab-list-pages td.ab-tdfile:contains(" + r + "):last"),
            h = $(".selected").next("ul").find("li:contains(" + r + "):last");

        return fileManager.query({cmsAction: 'renameFolder', oldName: u, newName: f}, function () {
          //$("#alerts").hide().remove();
          //$body.append('<div id="alerts" class="btn blue">' + t + "<\/div>");
          //$("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {$("#alerts").remove()});
          s.find("span").text(i);
          e.attr("href", f);
          o.attr("href", "editor.php?editfile=" + f);
          h.text(i);
        })
      }
      });
    $body.on("click", "a.delete-directory", function (t) {
      t.preventDefault();
      var i = $(this).attr("href"),
          r = i.match(/([^\/]*)\/*$/)[1],
          u = "#" + r;

      let tr = $(this).parents("tr");
      confirm('Delete folder "' + r + '" ?') &&
      fileManager.query({cmsAction: 'deleteFolder', dir: i},  function () {
          //$("#alerts").hide().remove();
          //$body.append('<div id="alerts" class="btn blue">' + t + "<\/div>");
          //$("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {$("#alerts").remove()});
          tr.hide(100).remove();
          $(u).next("ul").remove();
          $(u).remove()
        })
    });
    $body.on("click", "a.delete-file", function (t) {
      t.preventDefault();
      var i = $(this).attr("href"),
          r = i.match(/([^\/]*)\/*$/)[1],
          u = $(".selected").next("ul").find("li:contains(" + r + "):last");

      let tr = $(this).parents("tr");

      if (confirm('Удалить файл "' + r + '" ?')) {
        fileManager.query({cmsAction: 'deleteFile', dir: i},  function () {
          tr.hide(100).remove();
          u.remove();
          f.showMsg('Удалено');
        });
      }
    });

    $body.on("mousedown", "#zipsite, a.downloadfolder, a.downloadfile", function () {
      //var t = $(this);
      //t.html('<i class=" fa fa-refresh fa-spin fa-fw" aria-hidden="true"><\/i>');

      let cmsAction = this.dataset.action,
          dir = this.dataset.path;

      fileManager.query({cmsAction, dir, type: 'body'}, () => {});
      //setTimeout(function () {t.html('<i class=" fa fa-download" aria-hidden="true"><\/i>')}, 3000)
    });

    /*$body.on("change", "#file", function () {
      $("#frm-uploadfile").submit();
      $("#div-uploadfile").css("border-radius", 17).removeClass("fa-upload").addClass("fa-refresh fa-spin fa-fw")
    });*/

    $("#frm-uploadfile #file").on('drop', changeInput)
                              .on('change', changeInput);

    function changeInput (e) {
      e.preventDefault();

      let dir = $("#tree div.selected")[0].dataset.fo,
          files = e.originalEvent.dataTransfer ? e.originalEvent.dataTransfer.files : this.files;

      Object.values(files).forEach(file => {
        fileManager.form.append('files[]', file, file['name']);
      });

      fileManager.query({cmsAction: 'uploadFile', dir},  function () {
        t(dir);

        f.showMsg('Добавлено');
        /*let u = t.split("/");

        if (u.length > 1) {
          $.each(u, (i) => {
            let f = u[i].substr(u[i].lastIndexOf(".") + 1), e = r + u[i];
            f !== "" && $("#tree div.selected").next("ul").append('<li class="ext-file ext-' + f + '" style="border-right:1px solid red">' + u[i] + "<\/li>");
          }),

          $("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {
            $("#alerts").remove();
          })
        } else {
          $("#alerts").hide().remove();
          $body.append('<div id="alerts" class="btn blue">' + e + "<\/div>");
          $("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {$("#alerts").remove()});
          $("#div-uploadfile").css("border-radius", 2).removeClass("fa-refresh fa-spin fa-fw").addClass("fa-upload")
        }*/
      })
    }

    return this;
  },

  query(param, func) {
    let {type = ''} = param,
        queryParam;

    this.queryParam = Object.assign(this.queryParam, param);

    Object.entries(this.queryParam).map(param => {
      this.form.set(param[0], param[1]);
    })

    queryParam = {data: this.form};
    type && (queryParam.type = type);

    f.Post(queryParam).then(data => {
      if (type === 'body') f.saveFile({name: data['fileName'], blob: data});
      else func(data['html']);
    });
  },
}

document.addEventListener("DOMContentLoaded", () => {
  window.$ = window.$ || window['jQuery'];
  window.FileManagerInstance = fileManager;
  // Delay for hooks
  setTimeout(() => fileManager.init(), 0);
});
