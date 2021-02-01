
export const fileManager = {
  form: new FormData(),

  queryParam: {
    dbAction: '',
  },

  init() {

    const n = $;

    //showtable
    $.post('core/afm/showtable.php', {dir: '../../public'}, function (data) {
      $('#ab-container-table').html('').append(data);
    });

    //.................. loader, start page ....................
    var $preloader = document.getElementById("page-preloader"), $spinner = document.getElementById("spinner");
    $spinner.className += " hidden";
    $preloader.className += " hidden";

    function t(t) {
      n("body").append('<div id="alerts" class="btn blue">working..<\/div>');
      n("#alerts").fadeIn(1e3);
      n.post("core/afm/showtable.php", {dir: t}, function (t) {
        n("#ab-container-table").html("").append(t);
        n("#alerts").hide().remove()
      })
    }

    n("div.fo").next().hide(1, function () {n("#tree").css("display", "block")});
    n("body").on("click", "#tree div.fo", function () {
      n(this).next().toggle(100);
      n(".selected").removeClass("selected");
      var i = n(this).data("fo");
      t(i);
      n("#breadcrumb-links span").text(i);
      n(this).hasClass("closed") ? n(this).removeClass("closed").addClass("open selected") : n(this).removeClass("open").addClass("closed selected")
    });
    n("body").on("click", "#tree #home", function () {
      n("div.fo.open").next().hide(100);
      n("div.fo.open").removeClass("open").addClass("closed");
      n(".selected").removeClass("selected");
      var i = n(this).data("fo");
      t(i);
      n("#breadcrumb-links span").text(i);
      n(this).addClass("selected")
    });
    n("body").on("click", "td.ab-tdfolder a", function (i) {
      var r, f;
      i.preventDefault();
      r = n(this).attr("href");
      f = "#" + r.match(/([^\/]*)\/*$/)[1];
      t(r);
      var u = n("div.selected").next().find(f), e = u.parents("ul"), o = e.prev("div");
      u.parents("ul:hidden") && (e.css("display", "block"), o.removeClass("closed").addClass("open selected"));
      scroll = 1;
      u.click()
    });
    n("body").on("mouseenter", ".zoom", function (t) {
      t.preventDefault();
      n("body").append('<div id="imgpreview" style="background-color:#ddd;width:120px;position:fixed;z-index:9999;left:' + parseInt(t.clientX - 140) + "px;top:" + parseInt(t.clientY - 40) + 'px"><img src="' + n(this).attr("href") + '" alt="" width="120" height="" /><\/div>')
    });
    n("body").on("mouseleave", ".zoom", function () {n("#imgpreview").hide().remove()});
    n("body").on("click", "#a-create-folder", function (i) {
      var u, r, f;
      if (i.preventDefault(), u = n("#tree div.selected").data("fo"), r = prompt("Name directory:", ""), r != null && r != "") return n("body").append('<div id="alerts" class="btn blue">working..<\/div>'), n("#alerts").fadeIn(1e3), f = u + r + "/", n.ajax({
        url    : "core/afm/createfolder.php",
        data   : {urlfolder: f},
        success: function () {
          n("#tree div.selected").next("ul").append('<li><div id="' + r + '" data-fo="' + f + '" class="fo closed">' + r + '<\/div><ul style="display: none;"><\/ul><\/li>');
          t(u)
        },
        error  : function (t, i) {
          n("#alerts").remove();
          var r = "";
          r     = t.status === 0 ? "Not connect.\n Verify Network." : t.status == 404 ? "Requested page not found. [404]" : t.status == 500 ? "Internal Server Error [500]." : i === "parsererror" ? "Requested JSON parse failed." : i === "timeout" ? "Time out error." : i === "abort" ? "Ajax request aborted." : "Uncaught Error.\n" + t.responseText;
          n("body").append('<div id="alerts" class="btn red">' + r + "<\/div>");
          n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()})
        }
      }), n("#alerts").hide().remove(), !1
    });
    n("body").on("click", "#createfile", function (i) {
      var u, r, f;
      if (i.preventDefault(), u = n("#tree div.selected").data("fo"), r = prompt("Name file:", ""), r != null && r != "") return n("body").append('<div id="alerts" class="btn blue">working..<\/div>'), n("#alerts").fadeIn(1e3), f = u + r, n.ajax({
        url    : "core/afm/createfile.php",
        data   : {urlfile: f},
        success: function () {
          t(u);
          var i = r.substr(r.lastIndexOf(".") + 1);
          n("#tree div.selected").next("ul").append('<li class="ext-file ext-' + i + '" style="border-right:1px solid red">' + r + "<\/li>")
        },
        error  : function (t, i) {
          n("#alerts").remove();
          var r = "";
          r     = t.status === 0 ? "Not connect.\n Verify Network." : t.status == 404 ? "Requested page not found. [404]" : t.status == 500 ? "Internal Server Error [500]." : i === "parsererror" ? "Requested JSON parse failed." : i === "timeout" ? "Time out error." : i === "abort" ? "Ajax request aborted." : "Uncaught Error.\n" + t.responseText;
          n("body").append('<div id="alerts" class="btn red">' + r + "<\/div>");
          n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()})
        }
      }), n("#alerts").hide().remove(), !1
    });
    n("body").on("click", ".renamefolder", function (t) {
      t.preventDefault();
      var f = n(this).parents("tr").find("a.delete-directory").attr("href"),
          r = f.match(/([^\/]*)\/*$/)[1],
          i = prompt("New name:", r);
      if (i != null && i != "") {
        n("body").append('<div id="alerts" class="btn blue">working..<\/div>');
        n("#alerts").fadeIn(1e3);
        var u = f.replace(r, i),
            e = n("#ab-list-pages td.ab-tdfolder").find("a:contains(" + r + "):last"),
            o = n(".selected").next("ul").find("li div:contains(" + r + "):last"),
            s = n(this).parents("tr").find("a.delete-directory");
        return n.ajax({
          url    : "core/afm/renamefile.php",
          data   : {oldname: f, newname: u},
          success: function (t) {
            n("#alerts").hide().remove();
            n("body").append('<div id="alerts" class="btn blue">' + t + "<\/div>");
            n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()});
            e.attr("href", u).text(i);
            s.attr("href", u);
            o.attr("id", i).attr("data-fo", u).text(i)
          },
          error  : function (t, i) {
            n("#alerts").remove();
            var r = "";
            r     = t.status === 0 ? "Not connect.\n Verify Network." : t.status == 404 ? "Requested page not found. [404]" : t.status == 500 ? "Internal Server Error [500]." : i === "parsererror" ? "Requested JSON parse failed." : i === "timeout" ? "Time out error." : i === "abort" ? "Ajax request aborted." : "Uncaught Error.\n" + t.responseText;
            n("body").append('<div id="alerts" class="btn red">' + r + "<\/div>");
            n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()})
          }
        }), n("#alerts").remove(), !1
      }
    });
    n("body").on("click", ".renamefile", function (t) {
      t.preventDefault();
      var u = n(this).parents("tr").find("a.delete-file").attr("href"),
          r = u.match(/([^\/]*)\/*$/)[1],
          i = prompt("New name:", r),
          e = n(this).parents("tr").find("a.delete-file"),
          o = n(this).parents("tr").find("a.ab-edit-file");
      if (i != null && i != "") {
        n("body").append('<div id="alerts" class="btn blue">working..<\/div>');
        n("#alerts").fadeIn(1e3);
        var f = u.replace(r, i),
            s = n("#ab-list-pages td.ab-tdfile:contains(" + r + "):last"),
            h = n(".selected").next("ul").find("li:contains(" + r + "):last");
        return n.ajax({
          url    : "core/afm/renamefile.php",
          data   : {oldname: u, newname: f},
          success: function (t) {
            n("#alerts").hide().remove();
            n("body").append('<div id="alerts" class="btn blue">' + t + "<\/div>");
            n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()});
            s.find("span").text(i);
            e.attr("href", f);
            o.attr("href", "editor.php?editfile=" + f);
            h.text(i)
          },
          error  : function (t, i) {
            n("#alerts").remove();
            var r = "";
            r     = t.status === 0 ? "Not connect.\n Verify Network." : t.status == 404 ? "Requested page not found. [404]" : t.status == 500 ? "Internal Server Error [500]." : i === "parsererror" ? "Requested JSON parse failed." : i === "timeout" ? "Time out error." : i === "abort" ? "Ajax request aborted." : "Uncaught Error.\n" + t.responseText;
            n("body").append('<div id="alerts" class="btn red">' + r + "<\/div>");
            n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()})
          }
        }), n("#alerts").remove(), !1
      }
    });
    n("body").on("click", "a.delete-directory", function (t) {
      t.preventDefault();
      var i = n(this).attr("href"), r = i.match(/([^\/]*)\/*$/)[1], u = "#" + r;
      return tr = n(this).parents("tr"), confirm('Delete folder "' + r + '" ?') && (n("body").append('<div id="alerts" class="btn blue">working..<\/div>'), n("#alerts").fadeIn(1e3), n.ajax({
        url    : "core/afm/deletefolder.php",
        data   : {folder: i},
        success: function (t) {
          n("#alerts").hide().remove();
          n("body").append('<div id="alerts" class="btn blue">' + t + "<\/div>");
          n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()});
          tr.hide(100).remove();
          n(u).next("ul").remove();
          n(u).remove()
        },
        error  : function (t, i) {
          n("#alerts").remove();
          var r = "";
          r     = t.status === 0 ? "Not connect.\n Verify Network." : t.status == 404 ? "Requested page not found. [404]" : t.status == 500 ? "Internal Server Error [500]." : i === "parsererror" ? "Requested JSON parse failed." : i === "timeout" ? "Time out error." : i === "abort" ? "Ajax request aborted." : "Uncaught Error.\n" + t.responseText;
          n("body").append('<div id="alerts" class="btn red">' + r + "<\/div>");
          n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()})
        }
      })), n("#alerts").remove(), !1
    });
    n("body").on("click", "a.delete-file", function (t) {
      t.preventDefault();
      var i = n(this).attr("href"),
          r = i.match(/([^\/]*)\/*$/)[1],
          u = n(".selected").next("ul").find("li:contains(" + r + "):last");
      return tr = n(this).parents("tr"), confirm('Delete file "' + r + '" ?') && (n("body").append('<div id="alerts" class="btn blue">working..<\/div>'), n("#alerts").fadeIn(1e3), n.ajax({
        url    : "core/afm/deletefile.php",
        data   : {file: i},
        success: function (t) {
          n("#alerts").hide().remove();
          n("body").append('<div id="alerts" class="btn blue">' + t + "<\/div>");
          n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()});
          tr.hide(100).remove();
          u.remove()
        },
        error  : function (t, i) {
          n("#alerts").remove();
          var r = "";
          r     = t.status === 0 ? "Not connect.\n Verify Network." : t.status == 404 ? "Requested page not found. [404]" : t.status == 500 ? "Internal Server Error [500]." : i === "parsererror" ? "Requested JSON parse failed." : i === "timeout" ? "Time out error." : i === "abort" ? "Ajax request aborted." : "Uncaught Error.\n" + t.responseText;
          n("body").append('<div id="alerts" class="btn red">' + r + "<\/div>");
          n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()})
        }
      })), n("#alerts").remove(), !1
    });
    n("body").on("mousedown", "#zipsite, a.downloadfolder, a.downloadfile", function () {
      var t = n(this);
      t.html('<i class=" fa fa-refresh fa-spin fa-fw" aria-hidden="true"><\/i>');
      window.location = n(this).attr("href");
      setTimeout(function () {t.html('<i class=" fa fa-download" aria-hidden="true"><\/i>')}, 3e3)
    });
    n("body").on("change", "#file", function () {
      n("#frm-uploadfile").submit();
      n("#div-uploadfile").css("border-radius", 17).removeClass("fa-upload").addClass("fa-refresh fa-spin fa-fw")
    });
    n("#frm-uploadfile").submit(function (i) {
      var r, u;
      return n("body").append('<div id="alerts" class="btn blue">working..<\/div>'), r = n("#tree div.selected").data("fo"), n("#inputpath").val(r), i.preventDefault(), u = new FormData(this), n.ajax({
        type       : "POST",
        url        : "core/afm/uploadfile.php",
        cache      : !1,
        contentType: !1,
        processData: !1,
        data       : u,
        success    : function (i) {
          var u = i.split("/");
          Object.keys(u).length > 1 ? (n.each(u, function (i) {
            var f = u[i].substr(u[i].lastIndexOf(".") + 1),
                e = r + u[i];
            t(r);
            !f == "" && n("#tree div.selected").next("ul").append('<li class="ext-file ext-' + f + '" style="border-right:1px solid red">' + u[i] + "<\/li>")
          }), n("#alerts").hide().remove(), n("body").append('<div id="alerts" class="btn blue">Loaded<\/div>'), n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()})) : (n("#alerts").hide().remove(), n("body").append('<div id="alerts" class="btn blue">' + i + "<\/div>"), n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()}));
          n("#div-uploadfile").css("border-radius", 2).removeClass("fa-refresh fa-spin fa-fw").addClass("fa-upload")
        },
        error      : function (t, i) {
          n("#alerts").remove();
          var r = "";
          r     = t.status === 0 ? "Not connect.\n Verify Network." : t.status == 404 ? "Requested page not found. [404]" : t.status == 500 ? "Internal Server Error [500]." : i === "parsererror" ? "Requested JSON parse failed." : i === "timeout" ? "Time out error." : i === "abort" ? "Ajax request aborted." : "Uncaught Error.\n" + t.responseText;
          n("body").append('<div id="alerts" class="btn red">' + r + "<\/div>");
          n("#alerts").fadeIn(1e3).delay(1e3).fadeOut(1200, function () {n("#alerts").remove()})
        }
      }), n("#alerts").remove(), !1
    })

  },

  query() {

    Object.entries(this.queryParam).map(param => {
      this.form.set(param[0], param[1]);
    })

    f.Post({data: this.form}).then(data => {

    });
  },
}
