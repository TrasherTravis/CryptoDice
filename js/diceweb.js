"use strict";

function playClickSound() {
  // document.getElementById('click_sound').play();
}

function playWinSound() {
  // document.getElementById("win_sound").play();
}

function playLoseSound() {
  // document.getElementById("lose_sound").play();
}

function playNotificationSound() {
  // document.getElementById("notification_sound").play();
}

function playRainSound() {
  // document.getElementById("rain_sound").play();
}

function loggedInError() {
  toastError("You must be logged in to view that.");
}

let slotMachineInterval, mainRange;

function randomString(length) {
  const availableChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < length; i++) {
    randomString +=
      availableChars[Math.floor(Math.random() * availableChars.length)];
  }
  return randomString;
}

function updateAllBets() {
  $.ajax({
    url: "/api/all-bets",
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else if (!response.message) {
      } else {
        response.message.forEach(function (bet) {
          $("#allBetsTable").append(`
                        <tr>
                            <td>${bet.id.split("-")[0]}...</td>
                            <td>${bet.username}</ td>
                            <td>${bet.date}</td>
                            <td>${bet.amount}</td>
                            <td>${bet.payout} <sup>X</sup></td>
                            <td><span class="text-${
                              bet.profit > 0 ? "green" : "red"
                            }">${bet.profit}<img src="images/bitcoin-icon.svg" alt="" /></td>
                        </tr>
                    `);
        });
      }
    },
   
  });
}

function updateHighRollers() {
  $.ajax({
    url: "/api/high-rollers",
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else if (!response.message) {
      } else {
        $("#highRollersTable").empty();
        response.message.forEach(function (bet) {
          $("#highRollersTable").append(`
                        <tr>
                            <td>${bet.id.split("-")[0]}...</td>
                            <td>${bet.username}</ td>
                            <td>${bet.date}</td>
                            <td>${bet.amount}</td>
                            <td>${bet.payout} <sup>X</sup></td>
                            <td><span class="text-${
                              bet.profit > 0 ? "green" : "red"
                            }">${bet.profit}<img src="images/bitcoin-icon.svg" alt="" /></td>
                        </tr>
                    `);
        });
      }
    },
   
  });
}

function updateMyBets() {
  $.ajax({
    url: "/api/bet-history",
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else if (!response.message) {
        // $("#my_bets_stats_null").show();
        // $("#my_bets_stats_loading").hide();
      } else {
        $("#myBetsTable").empty();
        response.message.forEach(function (bet) {
          $("#myBetsTable").append(`
                        <tr>
                            <td>${bet.id.split("-")[0]}...</td>
                            <td>${bet.username}</ td>
                            <td>${bet.date}</td>
                            <td>${bet.amount}</td>
                            <td>${bet.payout} <sup>X</sup></td>
                            <td><span class="text-${
                              bet.profit > 0 ? "green" : "red"
                            }">${bet.profit}<img src="images/bitcoin-icon.svg" alt="" /></td>
                        </tr>
                    `);
        });
        // $("#my_bets_stats_loading").hide();
        // $("#my_bets_stats").show();
      }
    },
    
  });
}

//Check if user logged in on page load, and change right navbar correspondingly
$(document).ready(function () {
    const button = document.querySelector('#emoji-button');
    const picker = new EmojiButton();
    picker.on('emoji', emoji => {
        $("#chatInput").val($("#chatInput").val() + emoji);
    });
    button.addEventListener('click', () => {
      picker.togglePicker(button);
    });

    $("#navbar_user_dropdown").addClass("hide");
    $("#rollers-tab").click(loggedInError);
    $("#my-tab").click(loggedInError);
    updateAllBets();
    $.ajax({
      url: "/api/account",
      type: "GET",
      timeout: 20000,
      success: function (response) {
        if (response.valid === false) {
          toastError(response.message);
        } else {
          $("#button_logout_loading").hide();
          $("#button_bitcoin_balance").removeClass("hide");
          $("#button_user").removeClass("hide");
          $("#button_deposit").removeClass("hide");
          $("#button_withdraw").removeClass("hide");
          $("#button_fairness").removeClass("hide");
          $("#navbar_user_dropdown").removeClass("hide");
          $("#navbar_auth_buttons").addClass("hide");
          $("#navbar_user_dropdown").removeClass("is-active");
          $("#balance").text(`BTC ${response.message.balance}`);
          $("#depositInput1").val(response.message.depositAddress);
          $("#account_email").val(response.message.email);
          $("#my_stats_username").text(response.message.username);
          $("#profile_username").val(response.message.username);
          $("#profile_email").val(response.message.email);
          $("#fair_new_server").val(response.message.newServerSeedHashed);
          $("#fair_server").val(response.message.currentServerSeedHashed);
          $("#fair_client").val(response.message.currentClientSeed);
          $("#fair_nonce").val(response.message.nextNonce);
          $("#page_check_login_loading").addClass("hide");
          let url = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${response.message.depositAddress}`;
          $("#depositQRCode").attr("src", url);
          $("#rollers-tab").off("click", loggedInError);
          $("#my-tab").off("click", loggedInError);
          $("#rollers-tab").click(updateHighRollers);
          $("#my-tab").click(updateMyBets);
          $("#fair_new_client").val(randomString(30));
          getStats();
        }
      },
      
    });
    getBTCPrice();
});

//Signup AJAX request
$("#signupForm").submit(function (e) {
  e.stopPropagation();
  e.preventDefault();
  $("#signup_button").addClass("hide");
  $("#signup_button_loading").removeClass("hide");
  let validity = validation_form_signup();
  if (validity.valid) {
    var formData = {
      username: $("#signup_username").val().trim(),
      password: $("#signup_password").val().trim(),
      recaptchaToken: recaptchaToken,
    };
    $.ajax({
      url: "/api/signup",
      type: "POST",
      timeout: 20000,
      data: JSON.stringify(formData),
      contentType: "application/json",
      success: function (response) {
        if (response.valid === false) {
          toastError(response.message);
        } else {
          $("#button_bitcoin_balance").removeClass("hide");
          $("#button_user").removeClass("hide");
          $("#button_deposit").removeClass("hide");
          $("#button_withdraw").removeClass("hide");
          $("#button_fairness").removeClass("hide");
          $("#navbar_user_dropdown").removeClass("hide");
          $("#navbar_auth_buttons").addClass("hide");
          $("#navbar_user_dropdown").removeClass("is-active");
          $("#navbar_user_dropdown_link").removeClass(
            "navbar-user-dropdown-active"
          );
          $("#balance").text(`BTC ${response.message.balance}`);
          $("#depositInput1").val(response.message.depositAddress);
          $("#my_stats_username").text(response.message.username);
          $("#profile_username").val(response.message.username);
          $("#profile_email").val(response.message.email);
          $("#fair_new_server").val(response.message.newServerSeedHashed);
          $("#fair_server").val(response.message.currentServerSeedHashed);
          $("#fair_client").val(response.message.currentClientSeed);
          $("#fair_nonce").val(response.message.nextNonce);
          $.modal.close();
          let url = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${response.message.depositAddress}`;
          $("#depositQRCode").attr("src", url);
          playNotificationSound();
          toastSuccess(
            `Welcome to Betdice, ${response.message.username}!`
          );
          $("#button_chat_send").off("click");
          $("#chat_message").unbind("keypress");
          socket.close();
          socketFunction();
          $("#rollers-tab").off("click", loggedInError);
          $("#my-tab").off("click", loggedInError);
          $("#rollers-tab").click(updateHighRollers);
          $("#my-tab").click(updateMyBets);
          getStats();
        }
        $("#signup_button").removeClass("hide");
        $("#signup_button_loading").addClass("hide");
        recaptcha();
      },
     
    });
  } else {
    toastError(validity.message);
    $("#signup_button").removeClass("hide");
    $("#signup_button_loading").addClass("hide");
  }
});

function validation_form_signup() {
  let username = $("#signup_username").val().trim();
  let password = $("#signup_password").val().trim();
  if (username.length < 3)
    return {
      valid: false,
      message: "Username cannot be less than 3 characters.",
    };
  if (username.length > 12)
    return {
      valid: false,
      message: "Username cannot be more than 12 characters.",
    };
  if (!username.match(/^[0-9a-zA-Z]+$/))
    return {
      valid: false,
      message: "Username can only contain letters and numbers.",
    };
  if (password.length < 8)
    return {
      valid: false,
      message: "Password cannot be less than 8 characters.",
    };
  if (password.length > 50)
    return {
      valid: false,
      message: "Username cannot be more than 50 characters.",
    };
  return { valid: true, message: null };
}

//Login AJAX request
$("#loginForm").submit(function (e) {
  e.stopPropagation();
  e.preventDefault();
  $("#login_button").addClass("hide");
  $("#login_button_loading").removeClass("hide");
  var formData = {
    username: $("#login_username").val().trim(),
    password: $("#login_password").val().trim(),
    recaptchaToken: recaptchaToken
  };
  $.ajax({
    url: "/api/login",
    type: "POST",
    timeout: 20000,
    data: JSON.stringify(formData),
    contentType: "application/json",
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else {
        $("#win_balance_animation").hide();
        $("#lose_balance_animation").hide();
        $("#button_bitcoin_balance").removeClass("hide");
        $("#button_user").removeClass("hide");
        $("#button_deposit").removeClass("hide");
        $("#button_withdraw").removeClass("hide");
        $("#button_contest").removeClass("hide");
        $("#button_fairness").removeClass("hide");
        $("#button_invest").removeClass("hide");
        $("#button_affiliatecontest").removeClass("hide");
        $("#button_affiliates").removeClass("hide");
        $("#navbar_user_dropdown").removeClass("hide");
        $("#navbar_auth_buttons").addClass("hide");
        $("#navbar_auth_buttons").addClass("hide");
        $("#navbar_user_dropdown").removeClass("is-active");
        $("#navbar_user_dropdown_link").removeClass(
          "navbar-user-dropdown-active"
        );
        $("#balance").text(`BTC ${response.message.balance}`);
        $("#depositInput1").val(response.message.depositAddress);
        $("#current_server_seed_hashed").val(
          response.message.currentServerSeedHashed
        );
        $("#current_client_seed").val(response.message.currentClientSeed);
        $("#current_nonce").val(response.message.nextNonce);
        $("#new_server_seed_hashed").val(response.message.newServerSeedHashed);
        $("#profile_username").val(response.message.username);
        $("#profile_email").val(response.message.email);
        $("#fair_new_server").val(response.message.newServerSeedHashed);
        $("#fair_server").val(response.message.currentServerSeedHashed);
        $("#fair_client").val(response.message.currentClientSeed);
        $("#fair_nonce").val(response.message.nextNonce);
        $.modal.close();
        $("#button_username").text(response.message.username);
        $("#account_username").val(response.message.username);
        $("#account_email").val(response.message.email);
        $("#button_signup_login_group").addClass("hide");
        $("#modal_login").removeClass("is-active");
        let url = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${response.message.depositAddress}`;
        $("#depositQRCode").attr("src", url);
        playNotificationSound();
        toastSuccess(`Welcome back, ${response.message.username}!`);
        $("#button_chat_send").off("click");
        $("#chat_message").unbind("keypress");
        socket.close();
        socketFunction();
        $("#rollers-tab").off("click", loggedInError);
        $("#my-tab").off("click", loggedInError);
        $("#rollers-tab").click(updateHighRollers);
        $("#my-tab").click(updateMyBets);
        getStats();
      }
      $("#login_button").removeClass("hide");
      $("#login_button_loading").addClass("hide");
      recaptcha();
    },
   
  });
});

// Withdraw submit
$("#withdrawButton").click(function (e) {
  e.stopPropagation();
  $("#withdrawButton").addClass("hide");
  $("#withdrawButton_loading").removeClass("hide");
  var url = "/api/withdrawal";
  var formData = {
    withdrawAddress: $("#withdrawInput1").val().trim(),
    withdrawAmount: String($("#withdrawInput2").val().trim()),
  };
  $.ajax({
    url: url,
    type: "POST",
    timeout: 30000,
    data: JSON.stringify(formData),
    contentType: "application/json",
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
        toastSuccess(response.message);
      } else {
        playNotificationSound();
        toastSuccess("Withdrawal successful");
        $("#withdrawButton").removeClass("hide");
        $("#withdrawButton_loading").addClass("hide");
        $("#balance").text(`BTC ${response.message.balance}`);
      }
    },
    
  });
});

// New server-client seed submit
$("#fair_submit").click(function (e) {
  e.stopPropagation();
  let validity = validation_form_fairness();
  if (validity.valid) {
    $("#fair_submit").addClass("hide");
    $("#fair_submit_loading").removeClass("hide");
    var url = "/api/client-seed";
    var formData = {
      newClientSeed: $("#fair_new_client").val().trim(),
    };
    $.ajax({
      url: url,
      type: "POST",
      timeout: 5000,
      data: JSON.stringify(formData),
      contentType: "application/json",
      success: function (response) {
        if (response.valid === false) {
          toastError(response.message);
        } else {
          $("#fair_server").val(
            response.message.currentServerSeedHashed
          );
          $("#fair_client").val(response.message.currentClientSeed);
          $("#fair_nonce").val(response.message.nextNonce);
          $("#fair_new_server").val(
            response.message.newServerSeedHashed
          );
          $("#fair_new_client").val(randomString(30));
        }
        $("#fair_submit").removeClass("hide");
        $("#fair_submit_loading").addClass("hide");
      },
      
    });
  } else toastError(validity.message);
});

// Make chat rain
$("#button_chat_rain_submit").click(function (e) {
  e.stopPropagation();
  $("#button_chat_rain_submit_loading").show();
  $("#button_chat_rain_submit").hide();
  var url = "/api/chats/rain";
  let rainAmount = Number($("#chat_rain_amount").val().trim());
  rainAmount = rainAmount.toFixed(8);
  var formData = {
    rainAmount: rainAmount,
    rainNumberUsers: $("#chat_rain_users").val().trim(),
  };
  $.ajax({
    url: url,
    type: "POST",
    timeout: 5000,
    data: JSON.stringify(formData),
    contentType: "application/json",
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else {
        playNotificationSound();
        toastSuccess(response.message.notification);
        $("#balance").text(`BTC ${response.message.balance}`);
      }
      $("#button_chat_rain_submit_loading").hide();
      $("#button_chat_rain_submit").show();
    },
   
  });
});

function validation_form_fairness() {
  let newClientSeed = $("#fair_new_client").val().trim();
  if (newClientSeed === "")
    return { valid: false, message: "New client seed cannot be empty" };
  if (newClientSeed.length > 30)
    return {
      valid: false,
      message: "New client seed cannot be more than 30 characters",
    };
  return { valid: true, message: null };
}

function openSignUpModal() {
  $(".modal").removeClass("is-active");
  $("#modal_signup").addClass("is-active");
  $("#button_signup_submit").removeClass("hide");
  $("#button_signup_loading").addClass("hide");
  $("#signup_username").val(randomString(10));
}

var errortimeout;
function toastError(message) {
  $("#errorToastText").html(message);
  //$('#errorToast').toast('show');

  if (!$("#errorToast").hasClass("toast-show")) {
    $(".toast-wrap").css("z-index", 99);
    $("#errorToast").addClass("toast-show");
    $("#errorToast").removeClass("toast-hide");

    errortimeout = setTimeout(function () {
      $("#errorToast").addClass("toast-hide");
      $("#errorToast").removeClass("toast-show");
      $(".toast-wrap").css("z-index", 2);
    }, 6000);
  }
}

var successtimeout;
function toastSuccess(message) {
  $("#successToastText").html(message);
  if (!$("#errorToast").hasClass("toast-show")) {
    $("#successToast").addClass("toast-show");
    $("#successToast").removeClass("toast-hide");
    successtimeout = setTimeout(function () {
      $("#successToast").addClass("toast-hide");
      $("#successToast").removeClass("toast-show");
    }, 6000);
  }
}

function makeTimer(days, hours, minutes, seconds) {
  const plural = days >= 2;
  const displayDays = days >= 1;
  const daysDisplay = displayDays ? `${days} day${plural ? "s" : ""} ` : ``;
  $("#contest_timer").text(
    `${daysDisplay}${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`
  );
}

setInterval(function () {
  let UTCCurrentTimeMS = new Date().getTime();
  const someSundayInThePast = 1595721600000; //some Sunday
  const microSecondsInAWeek = 1000 * 60 * 60 * 24 * 7; // second * minute * hour * day * week
  const timeSinceLastSunday =
    (UTCCurrentTimeMS - someSundayInThePast) % microSecondsInAWeek;
  let timeToNextSunday = Math.floor((604800000 - timeSinceLastSunday) / 1000);
  // Get the rest of modulo operation and divide

  var days = Math.floor(timeToNextSunday / 24 / 60 / 60);
  var hoursLeft = Math.floor(timeToNextSunday - days * 86400);
  var hours = Math.floor(hoursLeft / 3600);
  var minutesLeft = Math.floor(hoursLeft - hours * 3600);
  var minutes = Math.floor(minutesLeft / 60);
  var remainingSeconds = timeToNextSunday % 60;
  makeTimer(days, hours, minutes, remainingSeconds);
}, 1000);

function pad(num, size) {
  const s = "000000000" + num;
  return s.substr(s.length - size);
}

$(".button-deposit").on("click", function (e) {
  e.stopPropagation();
  $("#modal_deposit").addClass("is-active");
});

$(".button-withdraw").on("click", function (e) {
  e.stopPropagation();
  $("#modal_withdraw").addClass("is-active");
  $("#button_withdraw_submit_loading").hide();
  $("#button_withdraw_submit").show();
});

$("#racesButton").on("click", function (e) {
  e.stopPropagation();
  $("#races_table > tbody").empty();
  let username = $("#profile_username").val().trim();
  console.log(username);
  if (!username) {
      $("#user_wager").hide();
      username = "a";
  } else $("#user_wager").show();
  $.ajax({
    url: `/api/races/${username}`,
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else {
        response.message.wagerRanking.forEach((user, index) => {
          $("#races_table > tbody:last-child").append(`
              <tr>
                  <td>${user.rank}</td>
                  <td>${user.username}</td>
                  <td>${user.wagered}</td>
                  <td class="d-flex"><span class="text-green">${user.prize}</span> <img class="modal-bitcoin-img" src="images/bitcoin-icon.svg" alt=""></td>
              </tr>
          `);
        });
        if (username) {
          if (response.message.user) {
            $("#user_wager_amount").text(`BTC ${response.message.user.wagered}`);
          } else {
            $("#user_wager_amount").text(`BTC 0.00000000`);
          }
        }
        
      }
    },
    
  });
});

$("#contest_previous_tab").on("click", function (e) {
  e.stopPropagation();
  $("#contest_table_loading").show();
  $("#contest_table").hide();
  $("#contest_previous_table").hide();
  $("#contest_no_entries").hide();
  $("#contest_table_previous_tbody").empty();
  $("#ztabs2 li a:not(:first)").addClass("zorange2");
  $("#ztabs2 li a:first").removeClass("zorange2");
  $.ajax({
    url: "/api/races/previous",
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else if (!response.message.ranking) {
        $("#contest_table_loading").hide();
        $("#contest_no_entries").show();
      } else {
        $("#contest_table_loading").hide();
        $("#contest_previous_table").show();
        response.message.ranking.forEach((user, index) => {
          let rankingLogo = "";
          if (index === 0) rankingLogo = "🥇";
          if (index === 1) rankingLogo = "🥈";
          if (index === 2) rankingLogo = "🥉";
          $("#contest_previous_table > tbody:last-child").append(`
                        <tr>
                            <td>${index + 1}</td>
                            <td>${rankingLogo} ${user.username}</td>
                            <td>BTC ${user.qualifiedWager}</td>
                            <td>BTC ${user.reward}</td>
                        </tr>
                    `);
        });
      }
    },
    
  });
});

$("#contest_tab").on("click", function (e) {
  e.stopPropagation();
  $("#contest_no_entries").hide();
  $("#contest_table").show();
  $("#contest_previous_table").hide();
  $("#ztabs2 li a:not(:first)").removeClass("zorange2");
  $("#ztabs2 li a:first").addClass("zorange2");
});

$("#button_fairness").on("click", function (e) {
  e.stopPropagation();
  $("#modal_fairness").addClass("is-active");
  $("#button_fairness_submit").show();
  $("#button_fairness_submit_loading").hide();
  $("#fair_new_client").val(randomString(30));
});

$("#button_affiliatecontest").on("click", function (e) {
  e.stopPropagation();
  $("#modal_affiliatecontests").addClass("is-active");
  $("#affiliate_contest_table_loading").show();
  $("#affiliate_contest_table").hide();
  $("#affiliate_contest_no_entries").hide();
  $("#affiliate_contest_table_tbody").empty();
  $("#affiliate_contest_user_table").hide();
  $("#affiliate_contest_user_table_tbody").empty();
  $.ajax({
    url: "/api/affiliates/contest",
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else if (!response.message.ranking) {
        $("#affiliate_contest_table_loading").hide();
        $("#affiliate_contest_no_entries").show();
        $("#affiliate_contest_user_table").show();
        $("#affiliate_contest_user_table > tbody:last-child").append(`
                    <tr>
                        <td>${$("#button_username").text()}</td>
                        <td>${response.message.userStats.referrals}</td>
                        <td>${response.message.userStats.referralWagered}</td>
                    </tr>
                `);
      } else {
        $("#affiliate_contest_table_loading").hide();
        $("#affiliate_contest_table").show();
        $("#affiliate_contest_user_table").show();
        response.message.ranking.forEach((user, index) => {
          $("#affiliate_contest_user_table > tbody:last-child").append(`
                        <tr>
                            <td>${index + 1}</td>
                            <td>${user.username}</td>
                            <td>BTC ${user.referrals}</td>
                            <td>BTC ${user.referralWagered}</td>
                            <td>BTC ${user.reward}</td>
                        </tr>
                    `);
        });
        $("#affiliate_contest_user_table > tbody:last-child").append(`
                    <tr>
                        <td>${$("#button_username").text()}</td>
                        <td>${response.message.userStats.referrals}</td>
                        <td>${response.message.userStats.referralWagered}</td>
                    </tr>
                `);
      }
    },
    
  });
});

$("#button_affiliates").on("click", function (e) {
  e.stopPropagation();
  $("#modal_affiliates").addClass("is-active");
  $("#referral_link_loading").show();
  $("#referral_link_display").hide();
  $.ajax({
    url: "/api/account/affiliates",
    type: "GET",
    timeout: 5000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else {
        $("#referral_link_loading").hide();
        $("#referral_link_display").show();
        $("#referral_link").val(
          `https://betdice.io/a?c=${response.message.affiliateCode}`
        );
        $("#number_affiliate").text(
          `${response.message.numberOfAffiliates} people.`
        );
        $("#affiliate_commission").text(
          `${response.message.commissionReceived} BTC.`
        );
      }
    },
   
  });
});

$("#button_signup").on("click", function (e) {
  e.stopPropagation();
  $("#modal_signup").addClass("is-active");
  $("#button_signup_submit").removeClass("hide");
  $("#button_signup_loading").addClass("hide");
  $("#signup_username").val(randomString(10));
});

$("#button_login").on("click", function (e) {
  e.stopPropagation();
  $("#modal_login").addClass("is-active");
  $("#button_login_submit").show();
  $("#button_login_loading").hide();
});

$("#signup_login_button").on("click", function (e) {
  $(".modal").removeClass("is-active");
  e.stopPropagation();
  $("#modal_login").addClass("is-active");
  $("#button_login_submit").show();
  $("#button_login_loading").hide();
});

$("#button_terms").on("click", function (e) {
  e.stopPropagation();
  $("#modal_terms").addClass("is-active");
});

$("#button_privacy").on("click", function (e) {
  e.stopPropagation();
  $("#modal_privacy").addClass("is-active");
});

$("#button_about_us").on("click", function (e) {
  e.stopPropagation();
  $("#modal_about_us").addClass("is-active");
});

$("#button_user").on("click", function (e) {
  e.stopPropagation();
  $("#modal_user").addClass("is-active");
  $("#button_account_save").show();
  $("#button_account_save_loading").hide();
});

$("#button_my_stats").on("click", function (e) {
  e.stopPropagation();
  $("#my_stats_username").val("");
  $("#my_stats_wins").val("");
  $("#my_stats_losses").val("");
  $("#my_stats_bets").val("");
  $("#my_stats_wagered").val("");
  $("#my_stats_profit").val("");
});

function getStats() {
  let url = `/api/account/stats`;
  $.ajax({
    url: url,
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else {
        let username = $("#button_username").text();
        $("#my_stats_wins").html(response.message.wins);
        $("#my_stats_losses").html(response.message.losses);
        $("#my_stats_bets").html(response.message.bets);
        $("#my_stats_wagered").html(`BTC ${response.message.wagered}`);
        $("#my_stats_profit").html(`BTC ${response.message.profit}`);
      }
    },
    error: function (x, t, m) {
      if (x.status === 403) {
        toastError("Please login first");
      } else {
        toastError("Connection issue");
      }
    },
  });
}

$("#button_history").on("click", function (e) {
  e.stopPropagation();
  $("#modal_history").addClass("is-active");
  $("#history_loading").show();
  $("#ztab1C").hide();
  $("#ztab2C").hide();
  $("#ztab3C").hide();
  $(".history-null").hide();
  $("#ztab1C_tbody").empty();
  $("#ztabs li a").removeClass("zorange");
  $("#ztab1").addClass("zorange");
  let url = `/api/account/bets/1`;
  $.ajax({
    url: url,
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else if (!response.message) {
        $("#history_loading").hide();
        $(".history-null").show();
      } else {
        let lightBackground = false;
        response.message.forEach(function (bet) {
          let classProfit;
          if (Number(bet.profit) > 0) {
            classProfit = "green";
          } else {
            classProfit = "gray";
          }
          var id = bet.id.substring(0, bet.id.indexOf("-"));
          if (!lightBackground) {
            $("#ztab1C-1 tbody").append(`
                            <tr>
                                <td class="bet-id" style="color:#00aaff;" onclick='tdClick(event);' id=${bet.id}>${id}</td>
                                <td class="hidme" >
                                    ${bet.date}
                                </td>
                                <td class="hidme">
                                    ${bet.amount}
                                </td>
                                <td class="hidme">
                                    ${bet.payout}
                                </td>
                                <td>
                                    ${bet.result}
                                </td>
                                <td>
                                    <span class=${classProfit}>${bet.profit}</span>
                                </td>
                            </tr>
                        `);
          } else {
            $("#ztab1C-1 tbody").append(`
                            <tr class="lighttr">
                                <td class="bet-id" style="color:#00aaff;" onclick='tdClick(event);' id=${bet.id}>${id}</td>
                                <td class="hidme" >
                                    ${bet.date}
                                </td>
                                <td class="hidme">
                                    ${bet.amount}
                                </td>
                                <td class="hidme">
                                    ${bet.payout}
                                </td>
                                <td>
                                    ${bet.result}
                                </td>
                                <td>
                                    <span class=${classProfit}>${bet.profit}</span>
                                </td>
                            </tr>
                        `);
          }
          lightBackground = !lightBackground;
        });
        $("#history_loading").hide();
        $("#ztab1C").show();
      }
    },
    error: function (x, t, m) {
      if (x.status === 403) {
        toastError("Please login first");
      } else {
        toastError("Connection issue");
      }
    },
  });
});

$("#ztab1").on("click", function (e) {
  e.stopPropagation();
  $("#modal_history").addClass("is-active");
  $("#history_loading").show();
  $("#ztab1C").hide();
  $("#ztab2C").hide();
  $("#ztab3C").hide();
  $(".history-null").hide();
  $("#ztab1C_tbody").empty();
  $("#ztabs li a").removeClass("zorange");
  $("#ztab1").addClass("zorange");
  let url = `/api/account/bets/1`;
  $.ajax({
    url: url,
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else if (!response.message) {
        $("#history_loading").hide();
        $(".history-null").show();
      } else {
        let lightBackground = false;
        response.message.forEach(function (bet) {
          let classProfit;
          if (Number(bet.profit) > 0) {
            classProfit = "green";
          } else {
            classProfit = "gray";
          }
          var id = bet.id.substring(0, bet.id.indexOf("-"));
          if (!lightBackground) {
            $("#ztab1C-1 tbody").append(`
                            <tr>
                                <td class="bet-id" style="color:#00aaff;" onclick='tdClick(event);' id=${bet.id}>${id}</td>
                                <td class="hidme" >
                                    ${bet.date}
                                </td>
                                <td class="hidme">
                                    ${bet.amount}
                                </td>
                                <td class="hidme">
                                    ${bet.payout}
                                </td>
                                <td>
                                    ${bet.result}
                                </td>
                                <td>
                                    <span class=${classProfit}>${bet.profit}</span>
                                </td>
                            </tr>
                        `);
          } else {
            $("#ztab1C-1 tbody").append(`
                            <tr class="lighttr">
                                <td class="bet-id" style="color:#00aaff;" onclick='tdClick(event);' id=${bet.id}>${id}</td>
                                <td class="hidme" >
                                    ${bet.date}
                                </td>
                                <td class="hidme">
                                    ${bet.amount}
                                </td>
                                <td class="hidme">
                                    ${bet.payout}
                                </td>
                                <td>
                                    ${bet.result}
                                </td>
                                <td>
                                    <span class=${classProfit}>${bet.profit}</span>
                                </td>
                            </tr>
                        `);
          }
          lightBackground = !lightBackground;
        });
        $("#history_loading").hide();
        $("#ztab1C").show();
      }
    },
    error: function (x, t, m) {
      if (x.status === 403) {
        toastError("Please login first");
      } else {
        toastError("Connection issue");
      }
    },
  });
});

$("#ztab2").on("click", function (e) {
  e.stopPropagation();
  $("#modal_history").addClass("is-active");
  $("#history_loading").show();
  $("#ztab1C").hide();
  $("#ztab2C").hide();
  $("#ztab3C").hide();
  $(".history-null").hide();
  $("#ztab2C_tbody").empty();
  $("#ztabs li a").removeClass("zorange");
  $("#ztab2").addClass("zorange");
  let url = `/api/account/deposits/1`;
  $.ajax({
    url: url,
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else if (!response.message) {
        $("#history_loading").hide();
        $(".history-null").show();
      } else {
        let lightBackground = false;
        response.message.forEach(function (deposit) {
          let classConfirmed;
          if (deposit.confirmation === "COMPLETED") {
            classConfirmed = "green";
          } else {
            classConfirmed = "gray2";
          }
          if (!lightBackground) {
            $("#ztab2C-1 tbody").append(`
                            <tr>
                                <td>
                                ${deposit.date}
                                </td>
                                <td class="hidme">
                                ${deposit.currency}
                                </td>
                                <td>
                                ${deposit.amount}
                                </td>
                                <td class="hidme">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.blockchain.com/btc/tx/${
                                  deposit.txid
                                }" >${deposit.txid.slice(0, 17)}...</a>
                                </td>
                                <td>
                                <span class=${classConfirmed}>${
              deposit.confirmation
            }</span>
                                </td>
                            </tr>
                        `);
          } else {
            $("#ztab2C-1 tbody").append(`
                            <tr class="lighttr">
                                <td>
                                ${deposit.date}
                                </td>
                                <td class="hidme">
                                ${deposit.currency}
                                </td>
                                <td>
                                ${deposit.amount}
                                </td>
                                <td class="hidme">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.blockchain.com/btc/tx/${
                                  deposit.txid
                                }" >${deposit.txid.slice(0, 17)}...</a>
                                </td>
                                <td>
                                <span class=${classConfirmed}>${
              deposit.confirmation
            }</span>
                                </td>
                            </tr>
                        `);
          }
          lightBackground = !lightBackground;
        });
        $("#history_loading").hide();
        $("#ztab2C").show();
      }
    },
    error: function (x, t, m) {
      if (x.status === 403) {
        toastError("Please login first");
      } else {
        toastError("Connection issue");
      }
    },
  });
});

$("#ztab3").on("click", function (e) {
  e.stopPropagation();
  $("#modal_history").addClass("is-active");
  $("#history_loading").show();
  $("#ztab1C").hide();
  $("#ztab2C").hide();
  $("#ztab3C").hide();
  $(".history-null").hide();
  $("#ztab3C_tbody").empty();
  $("#ztabs li a").removeClass("zorange");
  $("#ztab3").addClass("zorange");
  let url = `/api/account/withdrawals/1`;
  $.ajax({
    url: url,
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else if (!response.message) {
        $("#history_loading").hide();
        $(".history-null").show();
      } else {
        let lightBackground = false;
        response.message.forEach(function (withdrawal) {
          if (!lightBackground) {
            $("#ztab3C-1 tbody").append(`
                            <tr>
                                <td>
                                ${withdrawal.date}
                                </td>
                                <td class="hidme">
                                ${withdrawal.currency}
                                </td>
                                <td>
                                ${withdrawal.amount}
                                </td>
                                <td>
                                ${withdrawal.address}
                                </td>
                                <td class="hidme">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.blockchain.com/btc/tx/${
                                  withdrawal.txid
                                }">${withdrawal.txid.slice(0, 17)}...</a>
                                </td>
                            </tr>
                        `);
          } else {
            $("#ztab3C-1 tbody").append(`
                            <tr class="lighttr">
                                <td>
                                ${withdrawal.date}
                                </td>
                                <td class="hidme">
                                ${withdrawal.currency}
                                </td>
                                <td>
                                ${withdrawal.amount}
                                </td>
                                <td>
                                ${withdrawal.address}
                                </td>
                                <td class="hidme">
                                <a target="_blank" rel="noopener noreferrer" href="https://www.blockchain.com/btc/tx/${
                                  withdrawal.txid
                                }">${withdrawal.txid.slice(0, 17)}...</a>
                                </td>
                            </tr>
                        `);
          }
          lightBackground = !lightBackground;
        });
        $("#history_loading").hide();
        $("#ztab3C").show();
      }
    },
    error: function (x, t, m) {
      if (x.status === 403) {
        toastError("Please login first");
      } else {
        toastError("Connection issue");
      }
    },
  });
});

$("#profile_submit").on("click", function (e) {
  e.stopPropagation();
  let validity = validation_form_account();
  if (validity.valid) {
    $("#profile_submit").addClass("hide");
    $("#profile_submit_loading").removeClass("hide");
    var formData = {
      newPassword: $("#profile_password").val().trim(),
      newEmailAddress: $("#profile_email").val().trim(),
    };
    $.ajax({
      url: "/api/account",
      type: "POST",
      timeout: 5000,
      data: JSON.stringify(formData),
      contentType: "application/json",
      success: function (response) {
        if (response.valid === false) {
          toastError(response.message);
        } else {
          $("#profile_password").val("");
          if (response.message.email) {
            $("#profile_email").val(response.message.email);
          }
          toastSuccess(response.message.info);
        }
        $("#profile_submit").removeClass("hide");
        $("#profile_submit_loading").addClass("hide");
      },
     
    });
  } else toastError(validity.message);
});

$("#chat_rain_button").on("click", function (e) {
  e.stopPropagation();
  $("#modal_chat_rain").addClass("is-active");
  $("#button_chat_rain_submit_loading").hide();
  $("#button_chat_rain_submit").show();
});

$("#button_chat_rules").on("click", function (e) {
  e.stopPropagation();
  $("#modal_chat_rules").addClass("is-active");
});

function validation_form_account() {
  let password = $("#profile_password").val().trim();
  let email = $("#profile_email").val().trim();
  if (!email && !password)
    return {
      valid: false,
      message: "Missing email or password.",
    };
  if (password && password.length < 8)
    return {
      valid: false,
      message: "Password cannot be less than 8 characters.",
    };
  if (password && password.length > 50)
    return {
      valid: false,
      message: "Password cannot be more than 50 characters.",
    };
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email && !re.test(email))
    return {
      valid: false,
      message: "Invalid email address.",
    };
  return { valid: true, message: null };
}

$("#logoutButton").on("click", function (e) {
  e.stopPropagation();
  // $("#logoutButton").hide();
  // $("#logoutButton_loading").show();
  $.ajax({
    url: "/api/logout",
    type: "POST",
    timeout: 5000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
        $("#modal_user").addClass("is-active");
        $("#button_account_save").show();
        $("#button_account_save_loading").hide();
      } else {
        $("#modal_user").removeClass("is-active");
        $("#button_bitcoin_balance").addClass("hide");
        $("#button_user").addClass("hide");
        $("#button_deposit").addClass("hide");
        $("#button_withdraw").addClass("hide");
        $("#button_contest").addClass("hide");
        $("#button_fairness").addClass("hide");
        $("#button_affiliatecontest").addClass("hide");
        $("#button_affiliates").addClass("hide");
        $("#navbar_user_dropdown").addClass("hide");
        $("#navbar_auth_buttons").removeClass("hide");
        $("#button_signup_login_group").removeClass("hide");
        $("#balance").empty();
        $("#depositInput1").val("");
        $("#bitcoin_withdraw_address").val("");
        $("#withdraw_amount").val("");
        $("#signup_username").val("");
        $("#login_username").val("");
        $("#login_password").val("");
        $("#profile_username").val("");
        $("#account_email").val("");
        $("#account_password").val("");
        $("#current_server_seed_hashed").val("");
        $("#current_client_seed").val("");
        $("#current_nonce").val("");
        $("#new_server_seed_hashed").val("");
        $("#my_stats_username").val("");
        $("#my_stats_wins").val("");
        $("#my_stats_losses").val("");
        $("#my_stats_bets").val("");
        $("#my_stats_wagered").val("");
        $("#my_stats_profit").val("");
        $("#my_bets_stats_tbody").empty();
        playNotificationSound();
        toastSuccess("Logout successful. See you again soon!");
        $("#button_chat_send").off("click");
        $("#chat_message").unbind("keypress");
        socket.close();
        socketFunction();
      }
      $("#logoutButton").show();
      $("#logoutButton_loading").hide();
    },
    
  });
});

$(".navbar-burger").click(function () {
  // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
  $(".navbar-burger").toggleClass("is-active");
  $(".navbar-menu").toggleClass("is-active");
});

function logUsername(e) {
  const target = e.target;
  $("#chat_message").val($("#chat_message").val() + `@${$(target).text()} `);
}

// ----------Autobet Tabs------------
let switchTab = "manual";

$("#button_auto_bet").on("click", function (e) {
  e.stopPropagation();
  switchTab = "auto";
  $("#main-container").addClass("container-main-on-auto");

  $("#button_bet").addClass("hide");
  $("#button_bet_loading").addClass("hide");
  $("#button_autobet_start").removeClass("hide");
  // continue showing stop button or stop autobet once switch to manual tab?
});

$("#button_manual_bet").on("click", function (e) {
  e.stopPropagation();
  if (!autoBetStatus) {
    switchTab = "manual";
    $("#main-container").removeClass("container-main-on-auto");

    if (!manualBetStatus) {
      $("#button_bet").removeClass("hide");
    } else {
      $("#button_bet_loading").removeClass("hide");
    }
    $("#button_autobet_start").addClass("hide");
    $("#button_autobet_stop").addClass("hide");
  }
});

// ----------Close Modal------------
$(".modal_close").on("click", function () {
  $(".modal").removeClass("is-active");
});

$("body").click(function () {
  $(".modal").removeClass("is-active");
  $("#navbar_user_dropdown").removeClass("is-active");
  $("#navbar_user_dropdown_link").removeClass("navbar-user-dropdown-active");
});

// Stop closing modal when clicking on modal
$(".modal-card").on("click", function (e) {
  e.stopPropagation();
});

// ----------Tabs Switch------------
$("#all_bets_tabs").on("click", function (e) {
  e.stopPropagation();
  $("#all_bets_tabs").addClass("is-active");
  $("#my_bets_tabs").removeClass("is-active");
  $("#high_rollers_tabs").removeClass("is-active");
  $("#all_bets_table").show();
  $("#my_bets_table").hide();
  $("#high_rollers_table").hide();
});

$("#my_bets_tabs").on("click", function (e) {
  e.stopPropagation();
  $("#all_bets_tabs").removeClass("is-active");
  $("#my_bets_tabs").addClass("is-active");
  $("#high_rollers_tabs").removeClass("is-active");
  $("#all_bets_table").hide();
  $("#my_bets_table").show();
  $("#high_rollers_table").hide();
  $("#my_bets_stats_loading").show();
  $("#my_bets_stats").hide();
  $("#my_bets_stats_null").hide();
  $("#my_bets_stats_login").hide();
  $("#my_bets_stats_tbody").empty();
  $.ajax({
    url: "/api/bet-history",
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else if (!response.message) {
        $("#my_bets_stats_null").show();
        $("#my_bets_stats_loading").hide();
      } else {
        response.message.forEach(function (bet) {
          var id = bet.id.substring(0, bet.id.indexOf("-"));
          var profit = bet.profit;
          if (profit < 0) {
            $("#my_bets_stats tbody").append(`
                        <tr>
                            <td class="bet-id" style="color:#00aaff;" onclick='tdClick(event);' id=${bet.id}>${id}</td>
                            <td>${bet.username}</td>
                            <td>${bet.date}</td>
                            <td>${bet.amount}</td>
                            <td>x${bet.payout}</td>
                            <td style="color:#ff0000;">${bet.profit}</td>
                        </tr>
                    `);
          } else {
            $("#my_bets_stats tbody").append(`
                        <tr>
                            <td class="bet-id" style="color:#00aaff;" onclick='tdClick(event);' id=${bet.id}>${id}</td>
                            <td>${bet.username}</td>
                            <td>${bet.date}</td>
                            <td>${bet.amount}</td>
                            <td>x${bet.payout}</td>
                            <td style="color:#00ff00;">${bet.profit}</td>
                        </tr>
                    `);
          }
        });
        $("#my_bets_stats_loading").hide();
        $("#my_bets_stats").show();
      }
    },
    
  });
});

$("#high_rollers_tabs").on("click", function (e) {
  e.stopPropagation();
  $("#all_bets_tabs").removeClass("is-active");
  $("#my_bets_tabs").removeClass("is-active");
  $("#high_rollers_tabs").addClass("is-active");
  $("#all_bets_table").hide();
  $("#my_bets_table").hide();
  $("#high_rollers_table").show();
  $("#high_rollers_stats_loading").show();
  $("#high_rollers_stats").hide();
  $("#high_rollers_stats_null").hide();
  $("#high_rollers_stats_tbody").empty();
  $.ajax({
    url: "/api/high-rollers",
    type: "GET",
    timeout: 10000,
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else if (!response.message) {
        $("#high_rollers_stats_null").show();
        $("#high_rollers_stats_loading").hide();
      } else {
        response.message.forEach(function (bet) {
          var id = bet.id.substring(0, bet.id.indexOf("-"));
          var profit = bet.profit;
          if (profit < 0) {
            $("#high_rollers_stats tbody").append(`
                        <tr>
                            <td class="bet-id" style="color:#00aaff;" onclick='tdClick(event);' id=${bet.id}>${id}</td>
                            <td>${bet.username}</td>
                            <td>${bet.date}</td>
                            <td>${bet.amount}</td>
                            <td>x${bet.payout}</td>
                            <td style="color:#ff0000;">${bet.profit}</td>
                        </tr>
                    `);
          } else {
            $("#high_rollers_stats tbody").append(`
                        <tr>
                            <td class="bet-id" style="color:#00aaff;" onclick='tdClick(event);' id=${bet.id}>${id}</td>
                            <td>${bet.username}</td>
                            <td>${bet.date}</td>
                            <td>${bet.amount}</td>
                            <td>x${bet.payout}</td>
                            <td style="color:#00ff00;">${bet.profit}</td>
                        </tr>
                    `);
          }
        });
        $("#high_rollers_stats_loading").hide();
        $("#high_rollers_stats").show();
      }
    },
   
  });
});

//-----------Open Verify Bet Modal----------
function tdClick(e) {
  e.stopPropagation();
  $(".modal").removeClass("is-active");
  let betID = e.srcElement.id;
  let username = $(`#${betID}_username`).text();
  let amount = $(`#${betID}_amount`).text();
  let payout = $(`#${betID}_payout`).text();
  let profit = $(`#${betID}_profit`).text();
  $("#modal_verify_bet").addClass("is-active");
  $("#verify_bet_loading").show();
  $("#verify_bet").hide();
  $("#verify_bet_id").val("");
  $("#verify_username").val("");
  $("#verify_roll_number").val("");
  $("#verify_roll_direction").val("");
  $("#verify_bet_result").val("");
  $("#verify_bet_amount").val("");
  $("#verify_payout").val("");
  $("#verify_profit").val("");
  $("#verify_server_seed").val("");
  $("#verify_server_seed_hashed").val("");
  $("#verify_nonce").val("");
  let url = `/api/bet/${betID}`;
  $.ajax({
    url: url,
    type: "GET",
    timeout: 5000,
    success: function (response) {
      if (response.valid === false && !response.message) {
        let nonce = Math.floor(Math.random() * (10000 - 140 + 1)) + 140;
        payout = payout.substr(1);
        let winChance = 0.99 / payout;
        let rollNumber = Number((winChance * 10000).toFixed(0));
        let betResult;
        if (profit < 0) {
          betResult =
            Math.floor(Math.random() * (9999 - rollNumber + 1)) + rollNumber;
        } else {
          betResult = Math.floor(Math.random() * (rollNumber - 1 - 0 + 1)) + 0;
        }
        let serverSeedHashed = sha256(randomString(30));
        $("#verify_bet_id").val(betID);
        $("#verify_username").val(username);
        $("#verify_roll_number").val(rollNumber);
        $("#verify_roll_direction").val("under");
        $("#verify_bet_result").val(betResult);
        $("#verify_bet_amount").val(amount);
        $("#verify_payout").val(`x${payout}`);
        $("#verify_profit").val(profit);
        $("#verify_server_seed").val(
          "Revealed after server seed has been changed"
        );
        $("#verify_server_seed_hashed").val(serverSeedHashed);
        $("#verify_client_seed").val(randomString(30));
        $("#verify_nonce").val(nonce);
        $("#verify_bet_loading").hide();
        $("#verify_bet").show();
      } else {
        let serverSeed = response.message.serverSeed;
        if (!serverSeed) {
          serverSeed = "Revealed after server seed has been changed";
        }
        $("#verify_bet_id").val(response.message.id);
        $("#verify_username").val(response.message.username);
        $("#verify_roll_number").val(response.message.rollNumber);
        $("#verify_roll_direction").val(response.message.rollDirection);
        $("#verify_bet_result").val(response.message.betResult);
        $("#verify_bet_amount").val(response.message.betAmount);
        $("#verify_payout").val(`x${response.message.payout}`);
        $("#verify_profit").val(response.message.profit);
        $("#verify_server_seed").val(serverSeed);
        $("#verify_server_seed_hashed").val(response.message.serverSeedHashed);
        $("#verify_client_seed").val(response.message.clientSeed);
        $("#verify_nonce").val(response.message.nonce);
        $("#verify_bet_loading").hide();
        $("#verify_bet").show();
      }
    },
    error: function (x, t, m) {
      if (t === "timeout") {
        toastError("Connection issue");
      } else {
        toastError(t);
      }
    },
  });
}

function investCancel(e) {
  e.stopPropagation();
  $(`#${e.srcElement.id}`).addClass("hide");
  $(`#${e.srcElement.id}-loading`).removeClass("hide");
  var formData = {
    investBankrollStatusUUID: e.srcElement.id,
  };
  let url = "/api/investment/divest";
  $.ajax({
    url: url,
    type: "POST",
    timeout: 5000,
    data: JSON.stringify(formData),
    contentType: "application/json",
    success: function (response) {
      if (response.valid === false) {
        toastError(response.message);
      } else {
        toastSuccess(
          `Investment has been cancelled. BTC ${response.message.divestAmount} has been returned to your balance.`
        );
        $("#balance").text(`BTC ${response.message.balance}`);
      }
      $(`#${e.srcElement.id}`).removeClass("hide");
      $(`#${e.srcElement.id}-loading`).addClass("hide");
    },
    error: function (x, t, m) {
      if (x.status === 403) {
        toastError("Please sign up first");
        openSignUpModal();
      } 
      $(`#${e.srcElement.id}`).removeClass("hide");
      $(`#${e.srcElement.id}-loading`).addClass("hide");
    },
  });
}
// --------------Autobet-----------------
$("#on_lose_change_bet_value").on("change", function (e) {
  e.preventDefault();
  e.stopPropagation();
  let changeBetValue = $(this).val();
  changeBetValue = Number(changeBetValue).toFixed(2);
  if (changeBetValue === "" || changeBetValue <= 0) changeBetValue = "0.00";
  $("#on_lose_change_bet_value").val(changeBetValue);
});

$("#on_win_change_bet_value").on("change", function (e) {
  e.preventDefault();
  e.stopPropagation();
  let changeBetValue = $(this).val();
  changeBetValue = Number(changeBetValue).toFixed(2);
  if (changeBetValue === "" || changeBetValue <= 0) changeBetValue = "0.00";
  $("#on_win_change_bet_value").val(changeBetValue);
});

$("#max_bet_amount").on("change", function (e) {
  e.preventDefault();
  e.stopPropagation();
  let newAmount = $(this).val();
  if (isNaN(newAmount) || newAmount === "") {
    newAmount = "∞";
  } else {
    newAmount = Number(newAmount).toFixed(8);
    if (newAmount < 0.0000001) newAmount = "0.00000010";
  }
  $("#max_bet_amount").val(newAmount);
});

$("#number_of_bets").on("change", function (e) {
  e.preventDefault();
  e.stopPropagation();
  let numberBets = $(this).val();
  if (isNaN(numberBets) || numberBets === "") {
    numberBets = "∞";
  } else {
    numberBets = Number(numberBets).toFixed(0);
    if (numberBets <= 0) numberBets = "∞";
  }
  $("#number_of_bets").val(numberBets);
});

$("#autobet_profit_above").on("change", function (e) {
  e.preventDefault();
  e.stopPropagation();
  let profitAboveValue = $(this).val();
  profitAboveValue = Number(profitAboveValue).toFixed(8);
  if (profitAboveValue <= 0) profitAboveValue = "0.00000000";
  $("#autobet_profit_above").val(profitAboveValue);
});

$("#autobet_lose_exceed").on("change", function (e) {
  e.preventDefault();
  e.stopPropagation();
  let loseExceedsValue = $(this).val();
  loseExceedsValue = Number(loseExceedsValue).toFixed(8);
  if (loseExceedsValue <= 0) loseExceedsValue = "0.00000000";
  $("#autobet_lose_exceed").val(loseExceedsValue);
});

let diceGameMode = "manual";
let autoBetStatus = false;
let autoBetStopStatus = true;
let currentNumberOfBets = 0;
let currentProfit = 0;
let autobetAmount = 0;
let baseBet = "0.00000000";
let switchHighLowMode;
let previousBetStatus;

function autobet() {
    diceGameMode = "auto";
    let maxBetAmount = $("#max_bet_amount").val();
    let maxNumberBets = $("#number_of_bets").val();
    let profitAboveLimit = $("#autobet_profit_above").val();
    let LoseExceedsLimit = $("#autobet_lose_exceed").val();

    if (maxBetAmount !== "∞" && $("#bet_amount").val() > maxBetAmount) {
      autoBetStopStatus = true;
      autoBetStatus = false;
      $("#button_autobet_start").removeClass("hide");
      $("#button_autobet_stop").addClass("hide");
      toastSuccess("Autobet finished. Max bet amount reached.");
      return;
    }
    if (maxNumberBets !== "∞" && currentNumberOfBets >= maxNumberBets) {
      autoBetStopStatus = true;
      autoBetStatus = false;
      $("#button_autobet_start").removeClass("hide");
      $("#button_autobet_stop").addClass("hide");
      toastSuccess("Autobet finished. Max bets number reached.");
      return;
    }
    if (
      profitAboveLimit !== "0.00000000" &&
      currentProfit > 0 &&
      currentProfit > profitAboveLimit
    ) {
      autoBetStopStatus = true;
      autoBetStatus = false;
      $("#button_autobet_start").removeClass("hide");
      $("#button_autobet_stop").addClass("hide");
      toastSuccess("Autobet finished. Profit limit reached.");
      return;
    }
    if (
      LoseExceedsLimit !== "0.00000000" &&
      currentProfit < 0 &&
      currentProfit * -1 > LoseExceedsLimit
    ) {
      autoBetStopStatus = true;
      autoBetStatus = false;
      $("#button_autobet_start").removeClass("hide");
      $("#button_autobet_stop").addClass("hide");
      toastSuccess("Autobet finished. Lose limit reached.");
      return;
    }

    playClickSound();
    let validity = validation_form_bet();
    let rollDirection;
    if ($("#roll_direction").text() === "Roll under") {
      rollDirection = "under";
    } else {
      rollDirection = "over";
    }
    if (validity.valid) {
      $('.big-number').rollNumberInfinite({
        number: 2804, 
        speed: 500,
        interval: 200,
        rooms: 4,
        space: 80,
        fontStyle: {
            'font-family': 'inherit',
        }
      });
      var formData = {
        betAmount: $("#bet_amount").val().trim(),
        rollNumber: $("#roll_number").val().trim(),
        rollDirection: rollDirection,
      };
      socket.emit('bet', formData);
    } else {
      autoBetStopStatus = true;
      autoBetStatus = false;
      $("#button_autobet_start").removeClass("hide");
      $("#button_autobet_stop").addClass("hide");
      toastError(validity.message);
      return;
    }
}

$("#button_autobet_start").click(function (e) {
  currentNumberOfBets = 0;
  currentProfit = 0;
  autobetAmount = 0;
  baseBet = "0.00000000";
  e.stopPropagation();
  autoBetStatus = true;
  autoBetStopStatus = false;
  autobetAmount = $("#bet_amount").val();
  baseBet = $("#bet_amount").val();
  $("#button_autobet_start").addClass("hide");
  $("#button_autobet_stop").removeClass("hide");
  toastSuccess("Autobet started");
  autobet();
});

$("#button_autobet_stop").click(function (e) {
  e.stopPropagation();
  autoBetStopStatus = true;
  $("#button_autobet_start").removeClass("hide");
  $("#button_autobet_stop").addClass("hide");
});

// --------------Betting-----------------
let manualBetStatus = false;

$("#button_bet").click(function (e) {
  diceGameMode = "manual";
  if ($("#button_bet").prop("disabled")) {
    return false;
  }
  $("#button_bet").prop("disabled", true);
  e.stopPropagation();
  playClickSound();
  let validity = validation_form_bet();
  let rollDirection;
  if ($("#roll_direction").text() === "Roll under") {
    rollDirection = "under";
  } else {
    rollDirection = "over";
  }
  if (validity.valid) {
    $('.big-number').rollNumberInfinite({
      number: 2804, 
      speed: 500,
      interval: 200,
      rooms: 4,
      space: 80,
      fontStyle: {
          'font-family': 'inherit',
      }
    });
    manualBetStatus = true;
    var formData = {
      betAmount: $("#bet_amount").val().trim(),
      rollNumber: $("#roll_number").val().trim(),
      rollDirection: rollDirection,
    };
    socket.emit("bet", formData);
  } else {
    $("#button_bet").prop("disabled", false);
    toastError(validity.message);
  }
});

function validation_form_bet() {
  let betAmount = $("#bet_amount").val().trim();
  let rollNumber = $("#roll_number").val().trim();
  let betPayout = $("#bet_payout").val().trim();
  let winChance = $("#win_chance").val().trim();
  let betProfit = $("#bet_profit").val().trim();
  if (betAmount < 0.0000001)
    return {
      valid: false,
      message: "Bet amount must be at least BTC 0.00000010 (10 Satoshi).",
    };
  if ($("#roll_direction").text() === "Roll under") {
    if (rollNumber < 1 || rollNumber > 9800)
      return {
        valid: false,
        message: "Roll Number must be between 1 and 9800.",
      };
  } else {
    if (rollNumber < 199 || rollNumber > 9998)
      return {
        valid: false,
        message: "Roll Number must be between 199 and 9998.",
      };
  }
  if (betPayout <= 1)
    return { valid: false, message: "Bet payout must be greater than 1." };
  if (winChance <= 0 || winChance >= 99)
    return {
      valid: false,
      message: "Win chance must be between 0% and 98%.",
    };
  if (betProfit <= 0)
    return { valid: false, message: "Bet profit must be greater than 0." };
  return { valid: true, message: null };
}

//Update inputs when user typing bet amount
$(".bet_amount").on("change", function (e) {
  e.preventDefault();
  e.stopPropagation();
  $(".bet_amount").val($(this).val());
  if (e.originalEvent) changeBetAmount($(this).val());
});

function changeBetAmount(value) {
  let newAmount = Number(value).toFixed(8);
  if (newAmount < 0.0000001) newAmount = "0.00000010";
  $("#bet_amount").val(newAmount);
  calculateBetProfit();
  return false;
}

$(".roll_number").on("change", function (e) {
  e.preventDefault();
  e.stopPropagation();
  let rollNumber = $(this).val();
  $(".roll_number").val(rollNumber);
  mainRange.update({ from: rollNumber });
  if (e.originalEvent) runRollNumberChanges(rollNumber);
});

function runRollNumberChanges(rollNumber) {
  let rollNumberFixed = Number(rollNumber).toFixed(0);
  let maxRollNumber;
  let minRollNumber;
  if ($("#roll_direction").text() === "Roll under") {
    maxRollNumber = 9800;
    minRollNumber = 1;
  } else {
    maxRollNumber = 9998;
    minRollNumber = 199;
  }
  if (rollNumberFixed > maxRollNumber && rollNumber !== "") {
    $(".roll_number").val(maxRollNumber);
  } else if (rollNumberFixed < minRollNumber && rollNumber !== "") {
    $(".roll_number").val(minRollNumber);
  } else if (rollNumber !== "") {
    $(".roll_number").val(rollNumberFixed);
  }
  if (rollNumber === "") {
    $(".roll_number").val(minRollNumber);
  }
  calculateBetPayoutAfterRollNumber();
  calculateBetProfit();
}

$(".bet_payout").on("change", function (e) {
  e.preventDefault();
  e.stopPropagation();
  let betPayout = $(this).val();
  let betPayoutFixed = Number(betPayout).toFixed(4);
  let maxPayout = 9900;
  let minPayout = 1.0102;
  if (betPayout === "") betPayoutFixed = 0.0;
  if (betPayoutFixed > maxPayout) {
    $(".bet_payout").val(maxPayout);
  } else if (betPayoutFixed < minPayout) {
    $(".bet_payout").val(minPayout);
  } else {
    if (betPayoutFixed >= 10 && betPayoutFixed < 100)
      betPayoutFixed = Number(betPayoutFixed).toFixed(2);
    else if (betPayoutFixed >= 100 && betPayoutFixed < 1000)
      betPayoutFixed = Number(betPayoutFixed).toFixed(1);
    else if (betPayoutFixed >= 1000)
      betPayoutFixed = Number(betPayoutFixed).toFixed(0);
    $(".bet_payout").val(betPayoutFixed);
  }
  calculateBetPayoutAfterBetPayout();
  calculateBetProfit();
});

$(".win_chance").on("change", function (e) {
  e.preventDefault();
  e.stopPropagation();
  let winChance = $(this).val();
  let winChanceFixed = Number(winChance).toFixed(2);
  let maxWinChance = 98.0;
  let minwinChance = 0.01;
  if (winChance === "") winChanceFixed = 0.0;
  if (winChanceFixed > maxWinChance) {
    $(".win_chance").val(maxWinChance);
  } else if (winChanceFixed < minwinChance) {
    $(".win_chance").val(minwinChance);
  } else {
    $(".win_chance").val(winChanceFixed);
  }
  calculateBetPayoutAfterWinChance();
  calculateBetProfit();
});

function calculateBetProfit() {
  let betProfit = $(".bet_amount").val() * ($(".bet_payout").val() - 1);
  betProfit = (betProfit * 100000000) / 100000000;
  $(".bet_profit").val(betProfit.toFixed(8));
}

function calculateBetPayoutAfterRollNumber() {
  let winChance;
  if ($("#roll_direction").text() === "Roll under") {
    winChance = $(".roll_number").val() / 10000;
  } else {
    winChance = (9999 - $(".roll_number").val()) / 10000;
  }

  let betPayout = 0.99 / winChance;
  if (betPayout >= 10 && betPayout < 100)
    betPayout = Number(betPayout).toFixed(2);
  else if (betPayout >= 100 && betPayout < 1000)
    betPayout = Number(betPayout).toFixed(1);
  else if (betPayout >= 1000) betPayout = Number(betPayout).toFixed(0);
  else betPayout = Number(betPayout).toFixed(4);
  $(".win_chance").val((winChance * 100).toFixed(2));
  $(".bet_payout").val(betPayout);
}

function calculateBetPayoutAfterBetPayout() {
  let betPayout = $(".bet_payout").val();
  let winChance = 0.99 / betPayout;
  let rollNumber;
  if ($("#roll_direction").text() === "Roll under") {
    rollNumber = winChance * 10000;
  } else {
    rollNumber = 9999 - winChance * 10000;
  }
  $(".win_chance").val((winChance * 100).toFixed(2));
  $(".roll_number").val(rollNumber.toFixed(0));
}

function calculateBetPayoutAfterWinChance() {
  let winChance = $(".win_chance").val() / 100;
  let betPayout = 0.99 / winChance;
  let rollNumber;
  if ($("#roll_direction").text() === "Roll under") {
    rollNumber = winChance * 10000;
  } else {
    rollNumber = 9999 - winChance * 10000;
  }
  if (betPayout >= 10 && betPayout < 100)
    betPayout = Number(betPayout).toFixed(2);
  else if (betPayout >= 100 && betPayout < 1000)
    betPayout = Number(betPayout).toFixed(1);
  else if (betPayout >= 1000) betPayout = Number(betPayout).toFixed(0);
  else betPayout = Number(betPayout).toFixed(4);
  $(".roll_number").val(rollNumber.toFixed(0));
  $(".bet_payout").val(betPayout);
}

//-------------------SHA256 Function-----------------------
function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = "length";
  var i, j; // Used as a counter across the whole file
  var result = "";

  var words = [];
  var asciiBitLength = ascii[lengthProperty] * 8;

  //* caching results is optional - remove/add slash from front of this line to toggle
  // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
  // (we actually calculate the first 64, but extra values are just ignored)
  var hash = (sha256.h = sha256.h || []);
  // Round constants: first 32 bits of the fractional parts of the cube roots of the first 64 primes
  var k = (sha256.k = sha256.k || []);
  var primeCounter = k[lengthProperty];
  /*/
 var hash = [], k = [];
 var primeCounter = 0;
 //*/

  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += "\x80"; // Append Ƈ' bit (plus zero padding)
  while ((ascii[lengthProperty] % 64) - 56) ascii += "\x00"; // More zero padding
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return; // ASCII check: only accept characters in range 0-255
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  // process each chunk
  for (j = 0; j < words[lengthProperty]; ) {
    var w = words.slice(j, (j += 16)); // The message is expanded into 64 words as part of the iteration
    var oldHash = hash;
    // This is now the undefinedworking hash", often labelled as variables a...g
    // (we have to truncate as well, otherwise extra entries at the end accumulate
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      var i2 = i + j;
      // Expand the message into 64 words
      // Used below if
      var w15 = w[i - 15],
        w2 = w[i - 2];

      // Iterate
      var a = hash[0],
        e = hash[4];
      var temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) + // S1
        ((e & hash[5]) ^ (~e & hash[6])) + // ch
        k[i] +
        // Expand the message schedule if needed
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
              (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + // s0
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | // s1
              0);
      // This is only used once, so *could* be moved below, but it only saves 4 bytes and makes things unreadble
      var temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + // S0
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2])); // maj

      hash = [(temp1 + temp2) | 0].concat(hash); // We don't bother trimming off the extra ones, they're harmless as long as we're truncating when we do the slice()
      hash[4] = (hash[4] + temp1) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      var b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? 0 : "") + b.toString(16);
    }
  }
  return result;
}

/// ADDED

/// constructor accepts an object with
/// min minimum slider value - defaults to 2
// max maximum slider value - defaults to 98
// startingValue , value slider starts on , defaults to 50
// step slider step, defaults to 1
// eachStepValue - value per step eg. slider is 1-100 . to get 10000 on last step value is 100
// parent - no default - accepts a jquery parent eg $('#range-wrapper')
// sliderType "Over" or "Under" defaults to "Over"
// labelID Id for the label object defaults to range-label
// sliderID id for the slider defaults to range-slider
// rollNumberContainer - the input field parent for this slider eg  $("#roll_number")
class Slider {
  constructor(initializeObject) {
    this.min = initializeObject.min || 2;
    this.max = initializeObject.max || 98;
    this.value = initializeObject.startingValue || initializeObject.value || 50;
    this.step = initializeObject.step || 1;
    this.eachStepValue = initializeObject.eachStepValue || 100;
    this.parent = initializeObject.parent; /// jquery object eg $("#range")
    this.sliderType = initializeObject.sliderType || "Under";
    this.sliderID = initializeObject.sliderID || "range-slider";
    this.labelID = initializeObject.labelID || "range-label";
    this.rollNumberContainer = initializeObject.rollNumberContainer;
    this.additionalSideEffect =
      initializeObject.additionalSideEffect || function () {};

    const label = $(` <div class="range-label" id="${this.labelID}"></div>`);
    const slider = $(
      `<input id="${this.sliderID}" type="range" min="${this.min}" max="${this.max}" value="${this.value}" step="${this.step}" />`
    );

    this.parent.append(label);
    this.parent.append(slider);

    this.slider = $(`#${this.sliderID}`);
    this.label = $(`#${this.labelID}`);
    this.slider.on("input", () => {
      setTimeout(this.playSound(), 5);
      this.setValue(this);
    });

    document.addEventListener("DOMContentLoaded", this.setValue(this));

    this.sounds = [];
    this.audioIndex = 0;
    // mounting 8 audio elements so they can play on top of eachother
    for (let i = 0; i < 8; i++) {
      var snd = new Audio();
      var src = document.createElement("source");
      src.type = "audio/mpeg";
      snd.appendChild(src);
      this.sounds.push(snd);
    }
  }

  playSound() {
    if (this.audioIndex === 7) this.audioIndex = 0;
    setTimeout(() => this.sounds[this.audioIndex].play(), this.audioIndex * 50);

    this.audioIndex++;
  }

  get inputValueChange() {
    return this.slider.val() - this.slider.attr("min");
  }

  get inputValuePossibleChange() {
    return this.slider.attr("max") - this.slider.attr("min");
  }

  get sliderPercentFull() {
    return this.inputValueChange / this.inputValuePossibleChange;
  }

  get positionOffset() {
    return 40 - this.sliderPercentFull * 100 * 0.8;
  }

  toggleSlider() {
    this.sliderType = this.sliderType === "Over" ? "Under" : "Over";
    this.setValue();
  }
  changeValue(value) {
    const change = value / this.eachStepValue;
    if (change >= this.min && change <= this.max) {
      this.slider.val(Math.floor(change));
      this.setValue();
      return;
    }

    if (change < this.min) {
      this.slider.val(this.min);
    } else {
      this.slider.val(this.max);
    }
  }
  setValue() {
    this.rollNumberContainer.val(this.slider.val() * this.eachStepValue);

    this.slider.css(
      "background-image",
      "-webkit-gradient(linear, left top, right top, " +
        "color-stop(" +
        this.sliderPercentFull +
        `, ${this.sliderType === "Over" ? "#e74c3c" : "#27ae60"}), ` +
        "color-stop(" +
        this.sliderPercentFull +
        `, ${this.sliderType === "Over" ? "#27ae60" : "#e74c3c"})` +
        ")"
    );

    this.label.html(
      `<span>${this.sliderType} ${this.rollNumberContainer.val()}</span>`
    );
    this.label.css(
      "left",
      `calc(${this.sliderPercentFull * 100}% + (${this.positionOffset}px))`
    );
    this.additionalSideEffect();
  }
}

const slider = new Slider({
  parent: $("#range-wrap"),
  rollNumberContainer: $("#roll_number"),
  additionalSideEffect: () => {
    calculateBetPayoutAfterRollNumber();
    calculateBetProfit();
  },
});

// Roll number is number that was rolled
// betid is the id of the bet string
// win is bool true/false
//////
// all amounts are in satoshi
/////
function addToLiveHistory(bet) {
  // not this user
  if (bet.username !== $("#button_username").text()) {
    return;
  }
  const won = bet.profit > 0;
  const satInBTC = 100000000;
  addNewToLiveStats(
    bet.rollResult,
    bet.id,
    won,
    bet.amount * satInBTC,
    bet.profit * satInBTC
  );
}
function hideLiveStats() {
  $("#live-stats-container").css("display", "none");
}
function showLiveStats() {
  $("#live-stats-container").css("display", "");
}

const newLiveHistory = (
  won = 0,
  lost = 0,
  betTotal = 0,
  wonTotal = 0,
  rolls = []
) => {
  return {
    won,
    lost,
    betTotal,
    wonTotal,
    rolls,
  };
};

let liveBetHistoryState = newLiveHistory();

function renderLiveStatsFromState() {
  const markup = liveBetHistoryState.rolls.map(
    (history) => `<div
            onclick = "tdClick(event)"
            id="${history.betID}"
            class="${history.win ? "win" : "lose"}"
            >
                ${history.rollNum}
            </div>`
  );
  const { wonTotal, betTotal, won, lost } = liveBetHistoryState;
  $("#live-bet-history").html(markup);
  $("#live-stats-wins").text(won);
  $("#live-stats-loses").text(lost);
  $("#live-stats-betTotalAmount").text(satoshiToUserFriendlyBTC(betTotal));
  $("#live-stats-winTotalAmount").text(satoshiToUserFriendlyBTC(wonTotal));
}

// Theres 100mln satoshi in btc
function satoshiToUserFriendlyBTC(satoshi) {
  return (satoshi / 100000000).toFixed(8);
}

function resetLiveStats() {
  liveBetHistoryState = newLiveHistory();
  renderLiveStatsFromState();
}

// Roll number is number that was rolled
// betid is the id of the bet string
// win is bool true/false
//////
// all amounts are in satoshi
/////
function addNewToLiveStats(rollNum, betID, win, betAmount = 0, wonAmount = 0) {
  liveBetHistoryState.rolls.push({
    rollNum,
    betID,
    win,
  });
  if (win) liveBetHistoryState.won++;
  else liveBetHistoryState.lost++;

  liveBetHistoryState.betTotal += betAmount;
  liveBetHistoryState.wonTotal += wonAmount;

  // Only keys 6 in state, 5 is displayed and 6th is for animation
  // If we kept more in state this would be a memory leak
  // and would screw over automatic players over time
  // So the disappearence happens outside the bounds
  if (liveBetHistoryState.rolls.length === 6) liveBetHistoryState.rolls.shift();

  renderLiveStatsFromState();
}
/// END ADDED

function getBTCPrice() {
  $.ajax({
    url: "https://api.coindesk.com/v1/bpi/currentprice/USD.json",
    type: "GET",
    timeout: 5000,
    dataType: 'json',
    success: function (response) {
      $("#footerBTC").text(`$ ${response.bpi.USD.rate_float.toFixed(2)}`);
    }
  });
}
setInterval(getBTCPrice, 10000);
