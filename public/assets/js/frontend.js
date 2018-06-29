/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-06-09T17:19:43+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: frontend.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-29T14:35:02+05:45
 * @Copyright: Copyright 2018, Bashudev Poudel
 */
$(function() {
  var base_url = "http://worldcup.bizpati.com/"
  function formatDate(date) {
    var monthNames = [
      "January", "February", "March","April", "May", "June", "July","August", "September", "October","November", "December"
    ];
    date = new Date(date)
    var day = date.getDate();
    var monthIndex = date.getMonth();
    var year = date.getFullYear();
    var hour = date.getHours()
    var minute = date.getMinutes()
    return hour+':'+minute+', '+day + ' ' + monthNames[monthIndex] + ', ' + year;
  }
  function numberFormat(time) {
    if(time == 1)
      return "First";
    else if(time == 2)
      return "Second";
    else if(time == 3)
      return "Third";
    else if(time == 4)
      return "Fourth";
    else if(time == 5)
      return "Fifth";
    else if(time == 6)
      return "Sixth";
    else if(time == 7)
      return "Seventh";
    else if(time == 8)
      return "Eighth";
    else if(time == 9)
      return "Nineth";
    else
      return time+"'th";
  }
  function loadGame() {
    $.ajax({
      url: base_url+"frontend/game",
      success: function(response) {
        if(response.length == 0) {
          $("#gamelist").html('<div class="col-md-12">\
              <div class="alert alert-danger bg-bizpati">\
                No match for today.\
              </div>\
            </div>')
        }
        $.each(response, function(key, value) {
          var game = '<div class="col-lg-4">\
            <!-- START widget-->\
            <div class="panel widget">\
               <div class="panel-body bg-bizpati text-center">\
                  <div class="clearfix">\
                     <div class="pull-left">\
                       <div class="text-center">'+value.teamonedetails[0].name+'</div>\
                       <img src="'+base_url+'flags/'+value.teamonedetails[0].code+'.png" alt="'+value.teamonedetails[0].name+'" class="img-thumbnail img-circle" height="128" width="128" />\
                     </div>\
                     <div class="pull-right">\
                       <div class="text-center">'+value.teamtwodetails[0].name+'</div>\
                       <img src="'+base_url+'flags/'+value.teamtwodetails[0].code+'.png" alt="'+value.teamtwodetails[0].name+'" class="img-thumbnail img-circle" height="128" width="128" />\
                     </div>\
                  </div>\
                  <div class="row" style="margin-top:5px">\
                    <div class="col-md-6 col-xs-6">\
                      <center>\
                        <input type="text" class="form-control" data-match="'+value._id+'first" style="border-radius:0px; min-height:40px;max-width:80px">\
                      </center>\
                    </div>\
                    <div class="col-md-6 col-xs-6">\
                      <center>\
                        <input type="text" class="form-control" data-match="'+value._id+'second" style="border-radius:0px; min-height:40px;max-width:80px">\
                      </center>\
                    </div>\
                  </div>\
                  <div class="row clearfix">\
                    <div class="col-md-12">\
                      <button type="button" class="btn btn-danger btn-sm" data-predict="button'+value._id+'">Predict</button>\
                    </div>\
                  </div>\
                  <hr/>\
                  <h4 class="mt0">'+numberFormat(value.match)+' Match</h4>\
                  <p class="m0">\
                     <em class="fa fa-fw fa-map-marker"></em>'+value.location+'\
                   </p>\
                  <p class="m0">\
                     <em class="fa fa-fw fa-clock-o"></em>'+formatDate(value.time)+'\
                   </p><br>\
                   <a href="https://www.facebook.com/sharer/sharer.php?u=bizpati.com/worldcup&quote=Hello friends i just played predict and win with BizPati and predicted for '+value.teamonedetails[0].name+' vs '+value.teamtwodetails[0].name+'." target="_blank" class="btn btn-primary btn-sm"><i class="fa fa-facebook"></i> Share</a>\
               </div>\
            </div>\
            <!-- END widget-->\
          </div>'
          $("#gamelist").append(game)
        })
      }
    })
  }
  function loadLeaderboard() {
    $.ajax({
      url: base_url+"frontend/leaderboard/20",
      success: function(response) {
        $.each(response, function(key, value) {
          var game = '<tr>\
            <td>'+(key+1)+'</td>\
            <td>'+value.name+'</td>\
            <td>'+value.points+'</td>\
          </tr>'
          $("#leaderboard").append(game)
        })
      }
    })
  }
  function openInNewTab(url) {
    var win = window.open(url, '_blank');
    win.focus();
  }
  loadGame()
  loadLeaderboard()
  $(document).on("click", "[data-predict^=button]", function(e) {
    e.preventDefault()
    var id = $(this).attr("data-predict")
    var id_list = id.split("button")
    id = id_list[1]

    var first = $("[data-match="+id+"first]").val().trim()
    var second = $("[data-match="+id+"second]").val().trim()
    if(first != '' && second != '') {
      $(this).attr("disabled", true)
      $(this).html("Loading <i class='fa fa-spin fa-spinner'></i>")
      var selector = $(this)
      $.ajax({
        url: base_url+"frontend/predict/"+id+"/"+first+"/"+second,
        success: function(r) {
          if(r.error) {
            swal("Opps!!", r.message, "error")
            selector.html("<i class='fa fa-times'></i> Failed")
          } else {
            selector.html("<i class='fa fa-check'></i> Success")
            selector.removeClass("btn-danger")
            selector.addClass("btn-success")
            swal({
              title: "Congratulation!!",
              text: r.message,
              icon: "success",
              buttons: {
                share: {
                  text: "Share",
                  value: "share"
                },
                confirm: "OK"
              }
            }).then((value) => {
              switch (value) {
                case "share":
                  openInNewTab("https://www.facebook.com/sharer/sharer.php?u=bizpati.com/worldcup")
                  window.location.href = "/";
                  break;
                default:
                  window.location.href = "/";
              }
            })
          }
        },
        error: function(r) {
          console.log(r);
        }
      })
    } else {
      swal("Opps!", "Please fill out all fields!!", "error")
    }
  })
})
