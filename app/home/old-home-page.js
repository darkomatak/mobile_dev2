





const frameModule = require("tns-core-modules/ui/frame"); // 
const timerModule = require("tns-core-modules/timer");

"use strict";
/*
In NativeScript, a file with the same name as an XML file is known as
a code-behind file. The code-behind is a great place to place your view
logic, and to set up your page’s data binding.
*/
Object.defineProperty(exports, "__esModule", { value: true });
var geolocation = require("nativescript-geolocation");
var dialogs = require("tns-core-modules/ui/dialogs");




const connectivityModule = require("tns-core-modules/connectivity");
const fromObject = require("tns-core-modules/data/observable").fromObject;
const DatePicker = require("tns-core-modules/ui/date-picker").DatePicker;

var observable = require("tns-core-modules/data/observable");

const platformModule = require("tns-core-modules/platform");
const myConnectionType = connectivityModule.getConnectionType();
var view = require("tns-core-modules/ui/core/view");


var fetchModule = require("tns-core-modules/fetch");
var Odgovor = "";
var uuid = "";
var id_zaposlenika = 0;
var id_tvrtke = 0;
var count2 = 0;

var postoji_zaposlenik = false;
var citanje_tvrtke = false;
var isEditing = true;
var textFieldValue = "Gdje ?";
var textFieldValue2 = "Što ?";

var viewModel = new observable.Observable();
var arr_title = [];
var arr_title_id_tipa_posla = [];
global.x_location = 0;
global.y_location = 0;



function onPageLoaded(args) {
  var page = args.object;
  uuid = platformModule.device.uuid;
  var ObservableArray = require("tns-core-modules/data/observable-array").ObservableArray;


  const TODAY = new Date();
  const myConnectionType = connectivityModule.getConnectionType();

  

  geolocation.isEnabled().then(function (isEnabled) {
    if (!isEnabled) {
      geolocation.enableLocationRequest().then(function () {
      }, function (e) {
        //console.log("Error: " + (e.message || e));
      });
    }
  }, function (e) {
    //console.log("Error: " + (e.message || e));
  });




  id = timerModule.setInterval(() => {
    if (get_location() == true) {
      //console.log(' unutar citanja intervala ' + global.x_location);
    };
  }, 1000);






  if (myConnectionType != 0) {
    //alert('on page load  ima konekcija na internet idemo vidjeti ima li za bazu za  ovaj uuid ' + uuid);

    //ako postoji zaposlenik za taj uuid onda uzm i id_tvrtke,id_zaposlenika, naziv ( firme )
    ////console.log('ima_li_zaposlenika() =' + ima_li_zaposlenika());
    //var postoji_zaposlenik = ima_li_zaposlenika();
    fetch("https://radnovrijeme.eu/ws/postoji_lozinka.php", {
      method: "POST",
      mode: "same-origin",
      credentials: "same-origin",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'ulazna_varijabla': uuid
      })
    })
      .then((response) => response.json())
      .then((res) => {
        postoji_zaposlenik = res.status;
        if (postoji_zaposlenik == 'true') {
          //console.log(count2++ + ' ima zaposlenika za uuid' + uuid);
          //alert(' postoji zaposlenik koji ima ovaj uuid ' + uuid + ' kod kojeg je postavljena lozinka i idemo u čitanje tvrtke i promjenu naslova u action baru');
          citanje_tvrtke = true;
        } else {
          ////console.log(count2++ + ' nema i startaj upit za konekciju  za uuid' + uuid);
          //alert(' nema zaposlenika definiranog za ovaj uređaj')

          dialogs.prompt("Unesite broj za konekciju u formatu +38598458888", "+3859").then(function (r) {
            //console.log(count2++ + " Dialog result: " + r.result + ", text: " + r.text);
            if (r.result == true) {
              var tmp_odgovor = false;
              var broj = r.text;
              //console.log(count2++ + " mobitel: " + r.text + ' broj je ' + broj);

              fetch("https://radnovrijeme.eu/ws/prijava_zaposlenika.php", {
                method: "POST",
                mode: "same-origin",
                credentials: "same-origin",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  'uuid': uuid,
                  'broj': broj
                })
              })
                .then((response) => response.json())
                .then((res) => {
                  tmp_odgovor = res.status;
                  //console.log(count2++ + " tmp_odgovor unutar fetcha: " + tmp_odgovor);
                  if (tmp_odgovor == 'true') {
                    //alert(' Prijavili ste se u sustav, slijedi reload pagea i čitanje tvrtke u action baru !');
                    citanje_tvrtke = true;
                  } else {
                    alert(' Niste se prijavili u sustav, nazovite svog administratora da vam resetira mobitel postavke u aplikaciji  !');
                  }

                  //reload pagea
                }).catch((err) => {
                  //console.log(err);
                });



            }

          })

        }
        if (citanje_tvrtke == true) {
          //console.log(count2++ + ' idemo u čitanje podataka za tvrtku, employee ...');
          fetch("https://radnovrijeme.eu/ws/citanje_firme.php", {
            method: "POST",
            mode: "same-origin",
            credentials: "same-origin",
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              'uuid': uuid
            })
          })
            .then((response) => response.json())
            .then((res) => {
              //console.log(count2++ + " tmp_odgovor naziv unutar fetcha: " + res.naziv);
              //console.log(count2++ + " tmp_odgovor id_zaposlenika unutar fetcha: " + res.id_zaposlenika);
              //console.log(count2++ + " tmp_odgovor id_tvrtke unutar fetcha: " + res.id_tvrtke);
              //console.log(count2++ + " tmp_odgovor id_tvrtke unutar fetcha: " + res.naziv);
              id_zaposlenika = res.id_zaposlenika;
              id_tvrtke = res.id_tvrtke;

              page.actionBar.title = res.naziv;

              //----------------------------------------------------------------






              //console.log(count2++ + ' prije čitanja postavki');
              fetch("https://radnovrijeme.eu/ws/citanje_postavki.php", {
                method: "POST",
                mode: "same-origin",
                credentials: "same-origin",
                headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  'id_tvrtke': id_tvrtke,
                  'id_zaposlenika': id_zaposlenika
                })
              })
                .then((response) => response.json())
                .then((res) => {
                  //console.log(count2++ + ' citanje postavki 1');
                  var myarr = JSON.stringify(res);
                  //console.log(count2++ + ' citanje postavki 2');
                  var obj = JSON.parse(myarr);
                  //console.log(count2++ + ' citanje postavki 3');

                  var size = Object.keys(obj).length;
                  var i = 0;
                  var myTitles = [];
                  for (i = 0; i < size; i++) {
                    arr_title[i] = obj[i].naziv;
                    arr_title_id_tipa_posla[i] = obj[i].id_tipa_posla;
                    if (obj[i].id_tipa_posla == 1000) isEditing = false;
                    //console.log('isediting je ' + isEditing);

                    /*console.log(count2++ + " U bazi su podaci: " + arr_title[i]);
                    console.log(count2++ + " U bazi su podaci: " + obj[i].id_tipa_posla);
                    */
                    //myTitles = [{ title: arr_title[i] }];
                    var obj2 = {};
                    obj2["title"] = arr_title[i];
                    obj2["id_tipa_posla"] = arr_title_id_tipa_posla[i];
                    myTitles.push(obj2);

                  }




                  // citanje liste i reload stranice
                  const viewModel = fromObject({
                    myTitles,
                    isEditing: isEditing,
                    tfText: "",
                    tfText2: "",
                    tfText3: ""
                  });

                  page.bindingContext = viewModel;





                }).catch((err) => {
                  //console.log(err);
                });

            }).catch((err) => {
              //console.log(err);
            });

        }





      }).catch((err) => {
        //console.log(' error ' + err);
      });

  } else
    alert(' nemate konekciju na internet !');


}
exports.onPageLoaded = onPageLoaded;









function onEdit(args) {
  const page = args.object.page;
  /*if (isEditing === false) {
    isEditing = true;
  } else {
    isEditing = false;
  }
  */

  var navigationOptions = {
    moduleName: 'home/otherPages/pageTwo-page',
    context: {
      id_zaposlenika: id_zaposlenika,
      id_tvrtke: id_tvrtke
    }
  }

  frameModule.topmost().navigate(navigationOptions);

}
exports.onEdit = onEdit;



function onListViewLoaded(args) {
  const listView = args.object;
}
exports.onListViewLoaded = onListViewLoaded;

function onItemTap(args) {
  const index = args.index;
  const page = args.object.page;
  const TODAY = new Date();
  var ponovno_citanje_postavki = 0;

  const vm = page.bindingContext;
  //console.log(`Zapisujemo podatke u bazu : ${vm.get("tfText")}` + ' za zaposlenika:' + id_zaposlenika + 'za tvrtku ' + id_tvrtke + ' za vrijedonst unosa' + arr_title_id_tipa_posla[index]);
  var podatak1 = vm.get("tfText");
  var podatak2 = vm.get("tfText2");
  var podatak3 = vm.get("tfText3");

  //console.log(' podatak3 je ' + podatak3);

  var id_tipa_posla = arr_title_id_tipa_posla[index];
  if (id_tipa_posla == 1000) {
    isEditing = true;
  } else {
    isEditing = false;
  }


  //get_location();

  if (get_location() == true) {
    //console.log(global.x_location);
  };

  //console.log(global.x_location);






  //console.log(count2++ + ' podaci koji se zapisuju ' + podatak1 + ' ' + podatak2 + ' za zaposlenika ' + id_zaposlenika);
  fetch("https://radnovrijeme.eu/ws/pisanje_postavki.php", {
    method: "POST",
    mode: "same-origin",
    credentials: "same-origin",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'id_tvrtke': id_tvrtke,
      'id_zaposlenika': id_zaposlenika,
      'tfText': podatak1,
      'tfText2': podatak2,
      'tfText3': podatak3,
      'id_tipa_posla': id_tipa_posla,
      'x': global.x_location,
      'y': global.y_location
    })
  })
    .then((response) => response.json())
    .then((res) => {

      ponovno_citanje_postavki = 1;


      //console.log(count2++ + 'reload stranice slijedi');

      //console.log(count2++ + ' ponovno_citanje_postavki ima vrijednost  ' + ponovno_citanje_postavki);
      if (ponovno_citanje_postavki == 1) {
        //console.log(count2++ + ' idemo u novo citanje ');
        fetch("https://radnovrijeme.eu/ws/citanje_postavki.php", {
          method: "POST",
          mode: "same-origin",
          credentials: "same-origin",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            'id_tvrtke': id_tvrtke,
            'id_zaposlenika': id_zaposlenika
          })
        })
          .then((response) => response.json())
          .then((res) => {
            var myarr3 = JSON.stringify(res);
            //console.log(myarr3);
            var obj3 = JSON.parse(myarr3);
            //console.log(count2++ + 'objekt je procitan ' + obj3[0].naziv);
            var size = Object.keys(obj3).length;
            var i = 0;
            var myTitles = [];
            for (i = 0; i < size; i++) {
              arr_title[i] = obj3[i].naziv;
              arr_title_id_tipa_posla[i] = obj3[i].id_tipa_posla;
              if (obj3[i].id_tipa_posla == 1000) isEditing = false;
              var obj4 = {};

              obj4["title"] = arr_title[i];
              obj4["id_tipa_posla"] = arr_title_id_tipa_posla[i];

              myTitles.push(obj4);
              //console.log('isEditing =' + isEditing);

            }





            // citanje liste i reload stranice
            const viewModel = fromObject({
              myTitles,
              isEditing: isEditing,
              tfText: "",
              tfText2: "",
              tfText3: ""
            });

            page.bindingContext = viewModel;



          }).catch((err) => {
            //console.log(err);
          });

      }


    }).catch((err) => {
      //console.log(err);
    });


}
exports.onItemTap = onItemTap;






Object.size = function (obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};


function get_location() {
  watchId = geolocation.watchLocation(
    function (loc) {
      if (loc) {
        global.x_location = loc.latitude;
        global.y_location = loc.longitude;
        //console.log("Received location: " + loc.latitude);
        return true;
      } else {
        //console.log(' nema loca ');
        global.x_location = 0;
        global.y_location = 0;

        return true;

      }
    },
    function (e) {
      console.log("Error: " + e.message);
      global.x_location = 0;
      global.y_location = 0;
      return true;
    },
    { desiredAccuracy: 3, updateDistance: 10, minimumUpdateTime: 1000 }); // should 

  return true;
};



