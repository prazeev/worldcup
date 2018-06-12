/**
 * @Author: Bashudev Poudel <prazeev>
 * @Date:   2018-06-09T17:19:43+05:45
 * @Email:  prazeev@gmail.com
 * @Filename: frontend.js
 * @Last modified by:   prazeev
 * @Last modified time: 2018-06-09T18:09:21+05:45
 * @Copyright: Copyright 2018, Bashudev Poudel
 */
$(function() {
  var base_url = "http://localhost:8261/"
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
                        <input type="text" class="form-control" style="border-radius:0px; min-height:40px;max-width:80px">\
                      </center>\
                    </div>\
                    <div class="col-md-6 col-xs-6">\
                      <center>\
                        <input type="text" class="form-control" style="border-radius:0px; min-height:40px;max-width:80px">\
                      </center>\
                    </div>\
                  </div>\
                  <div class="row clearfix">\
                    <div class="col-md-12">\
                      <button type="button" class="btn btn-danger btn-sm">Predict</button>\
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
               </div>\
            </div>\
            <!-- END widget-->\
          </div>'
          $("#gamelist").append(game)
        })
      }
    })
  }
  loadGame()
})
