function addRemoveDiv() {
  var width = $(window).width();
  $("body").css({
    "padding-top": $("header").outerHeight(),
  });
}

function alignHeader() {
  if ($(window).width() > 1200) {
    if (
      $("html").hasClass("auto-bet-show") &&
      $("html").hasClass("chat-show")
    ) {
      $("header>.container>.row").removeClass("justify-content-xl-between");
      $("header>.container>.row div").removeClass("mb-xl-0");
      setTimeout(addRemoveDiv, 250);
    } else {
      $("header>.container>.row").addClass("justify-content-xl-between");
      $("header>.container>.row div").addClass("mb-lg-0");
      setTimeout(addRemoveDiv, 250);
    }
  } else {
    if (
      $("html").hasClass("auto-bet-show") ||
      $("html").hasClass("chat-show")
    ) {
      $("header>.container>.row").removeClass("justify-content-lg-between");
      $("header>.container>.row div").removeClass("mb-lg-0");
      setTimeout(addRemoveDiv, 250);
    } else {
      $("header>.container>.row").addClass("justify-content-lg-between");
      $("header>.container>.row div").addClass("mb-lg-0");
      setTimeout(addRemoveDiv, 250);
    }
  }
}

function setChatHdHt() {
  var width = $(window).width();
  $(".c-head").css({
    "min-height": $("header").outerHeight(),
  });
}

$(window).load(function () {
  $("body").addClass("loaded");
  addRemoveDiv();
  setChatHdHt();
});
$(window).on("resize", function () {
  addRemoveDiv();
  setChatHdHt();
});
$(document).ready(function () {
  var width = $(window).width();
  if (width < 767) {
    $("html").removeClass("chat-show");
    $("html").removeClass("auto-bet-show");
  }
});

$(window).scroll(function () {
  var height = $(window).scrollTop();
  if (height > 50) {
    $("html").addClass("sticky");
  } else {
    $("html").removeClass("sticky");
  }
});

$(document).ready(function () {
  $(".chat-toggle").click(function () {
    $("html").toggleClass("chat-show");

    setTimeout(alignHeader, 250);
    setTimeout(setChatHdHt, 250);
  });
  $(".chat-close").click(function () {
    $("html").removeClass("chat-show");
  });
  $('#myTab a[href="#home"]').on("shown.bs.tab", function (e) {
    $('#myTab a[href="#profile"]').removeClass("active");
    $('#myTab a[href="#home"]').addClass("active");
    $("#profile").removeClass("show");
    setTimeout(alignHeader, 250);

    setTimeout(setChatHdHt, 250);
  });
  $(".auto-bet-open").click(function (e) {
    if ($("html").hasClass("auto-bet-show")) {
      e.preventDefault();
      $("html").removeClass("auto-bet-show");

      $('#myTab a[href="#home"]').tab("show");
      $("#profile").removeClass("active");
    } else {
      $("html").addClass("auto-bet-show");
      setTimeout(alignHeader, 250);

      setTimeout(setChatHdHt, 250);
    }
  });
  $(".auto-bet-close").click(function () {
    $("html").removeClass("auto-bet-show");
  });
});
