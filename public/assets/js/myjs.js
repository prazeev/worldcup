/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-05-19T10:48:05+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: myjs.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-09T14:37:10+05:45
 * @Copyright: Copyright 2018, Bashudev Poudel
 */
 // pre-submit callback
 function showRequest() {
   $("[type=submit]").attr("disabled", true)
   return true;
 }
 function showResponse(response)  {
   console.log(response)
   $("[type=submit]").attr("disabled", false)
   if(response.status == true) {
     swal("Good Job!", response.message, "success")
     if(response.redirect)
       window.location.href = response.redirect;
   } else {
     swal("Opps!", response.message, "error")
   }
}
 $(function() {
   var options = {
     beforeSubmit:  showRequest,
     success:       showResponse
  };
  $('.ajaxForm').ajaxForm(options);

  // for ajax click
  $(document).on("click",".ajaxClick", function(e) {
    e.preventDefault()
    var href = $(this).attr("href")
    if($(this).hasClass('noDialog'))
      var dialog = true
    else
      var dialog = confirm("Are you sure?")
    if(dialog == true) {
      $.ajax({
        url: href,
        success: function(response) {
          if(response.status == true) {
            swal("Good Job!", response.message, "success")
            if(response.redirect)
              window.location.href = response.redirect;
          } else {
            swal("Opps!", response.message, "error")
          }
        }
      })
    } else {
      swal("You are safe!!","Your data is safe!","success")
    }
  })

  // For gropus selection
  $(document).on("change", '[name="game"]', function(e) {
    var base_url = window.location.origin+"/";
    var game = $(this).val()
    if(game != '') {
      $.ajax({
        url: base_url+"api/group/"+game,
        success: function(result) {
          $("#game-group").html('')
          $("#game-group").html('<option value="">--SELECT GROUP--</option>')
          $.each(result, function(key, value) {
            $("#game-group").append("<option value='"+value._id+"'>"+value.name+"</option>")
          })
        }
      })
    }
  })

  $(document).on("change", '#game-group', function(e) {
    var base_url = window.location.origin+"/";
    var group = $(this).val()
    var game = $('[name="game"]').val()
    // alert(base_url+"api/teams/"+game+"/"+group)
    $.ajax({
      url: base_url+"api/teams/"+game,
      success: function(result) {
        $(".team").html('<option value="">--SELECT TEAM--</option>')
        $.each(result, function(key, value) {
          $(".team").append('<option value="'+value._id+'">'+value.name+'</option>')
        })
      },
      error: function(e) {
        console.log(e);
      }
    })
  })
  // Timepicker
  $(".datetime").datetimepicker({format: 'yyyy-mm-dd hh:ii', autoclose: true,todayBtn: true,showMeridian: true});

  // Countdown
  $.each($(".timer"), function(key, value) {
    var current = $(this)
    var date = current.attr("currentTime")
    var gamedate = current.attr("matchTime")
    var fromDate = new Date(date)
    var toDate = new Date(gamedate)
    var differenceTravel = toDate.getTime() - fromDate.getTime();
    var seconds = Math.floor((differenceTravel) / (1000));
    current.attr("data-time", seconds)
  })
  function secondsToHms(d) {
      d = Number(d);
      var h = Math.floor(d / 3600);
      var m = Math.floor(d % 3600 / 60);
      var s = Math.floor(d % 3600 % 60);

      var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
      var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
      var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
      return hDisplay + mDisplay + sDisplay;
  }
  function timer() {
    setInterval(function() {
      $.each($(".timer"), function() {
        var current = $(this)
        if(current.attr("data-time") != 0) {
          var time = parseInt(current.attr("data-time"))
          time--
          current.attr("data-time", time)
          current.html(secondsToHms(time))
        }
      })
    }, 1000)
  }
  timer()
})
