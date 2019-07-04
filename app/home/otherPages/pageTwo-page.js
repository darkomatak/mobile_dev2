const fromObject = require("tns-core-modules/data/observable").fromObject;
const DatePicker = require("tns-core-modules/ui/date-picker").DatePicker;
var count2 = 1000;
var isEditing2 = true;

function onNavigatingTo(args) {
    var page = args.object;
    const TODAY = new Date();
    isEditing2 = true;
    var gotData = page.navigationContext;
    id_zaposlenika = gotData.id_zaposlenika;

    console.log(gotData.id_zaposlenika);
    console.log(gotData.id_tvrtke);


    const viewModel = fromObject({
        currentMonth: TODAY.getMonth() + 1,
        currentYear: TODAY.getFullYear(),
        isEditing2: isEditing2
    });

    page.bindingContext = viewModel;


}
exports.onNavigatingTo = onNavigatingTo;


function buttonTap(args) {

    const index = args.index;
    const page = args.object.page;

    var gotData = page.navigationContext;
    //console.log(gotData.id_zaposlenika);
    //console.log(gotData.id_tvrtke);
    id_zaposlenika = gotData.id_zaposlenika;
    id_tvrtke = gotData.id_tvrtke;


    const vm = page.bindingContext;
    //console.log(' nakon loada podataka ');
    var mjesec = vm.get("currentMonth");
    var godina = vm.get("currentYear");


    page.actionBar.title = "Izvještaj - " + mjesec + " mjesec";
    //console.log(' podaci koji se zapisuju mjesec, godina ' + mjesec + ' ' + godina);
    //alert(' Izvještaj za : ' + mjesec + '/' + godina + ' za zaposlenika ' + gotData.id_zaposlenika + 'id_tvrtke=' + gotData.id_tvrtke);
    //console.log("Topmost: " + frameModule.topmost());
    page.bindingContext.set("isEditing2", false);
    // report o učinku zaposlenika ...fetch podataka



    //console.log(count2++ + ' idemo u novo citanje ');
    fetch("https://radnovrijeme.eu/ws/citanje_podataka_mobile_produkcija.php", {
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
            'mjesec': mjesec,
            'godina': godina
        })
    })
        .then((response) => response.json())
        .then((res) => {
            //console.log(' procitao nesto ');
            var myarr3 = JSON.stringify(res);
            var obj3 = JSON.parse(myarr3);
            //console.log(' duljin JE ' + Object.keys(obj3).length)
            if (Object.keys(obj3).length > 0) {
                //console.log(count2++ + 'objekt je procitan ' + obj3[0].naziv);
                var size = Object.keys(obj3).length;
                var i = 0;
                var tmpVrijeme = 0;
                var myTitles = [];
                var mySum = [];
                var tmp_obj5 = {};
                tmp_obj5["title"] = '';
                tmp_obj5["total_hours"] = 0;
                var space_str = '___________________________________________';
                //console.log(' prije petlje');
                for (i = 0; i < size; i++) {
                    var obj4 = {};
                    var obj5 = {};
                    tmpVrijeme = time_convert(60 * obj3[i].total_hours);

                    obj5["title"] = obj3[i].naziv
                    obj5["total_hours"] = obj3[i].total_hours;
                    // vrijeme koje se prikazuje a koje se ne zbraja total_hours2 za sumu
                    obj5["total_hours2"] = tmpVrijeme;


                    obj4["title"] = obj3[i].day + ' ' + obj3[i].naziv
                    obj4["total_hours"] = obj3[i].total_hours;
                    // vrijeme koje se prikazuje a koje se ne zbraja total_hours2 za svaku stavku posebno
                    obj4["total_hours2"] = tmpVrijeme;


                    //console.log(obj4["total_hours"] + ' ' + obj4["total_hours2"]);

                    myTitles.push(obj4);
                    //console.log(count2++ + 'trazim ' + ' ' + obj3[i].naziv);


                    if (inArrayOfObjects(mySum, obj3[i].naziv, 'title')) {
                        //console.log(' nađeno je kod dodavanja vrijednosti' + mySum[0].title)

                        mySum.forEach((title, index, array) => {
                            //console.log(mySum.title); // 100, 200, 300
                            //console.log(index); // 0, 1, 2
                            if (mySum[index].title == obj3[i].naziv) {
                                var tmp1 = Number(mySum[index].total_hours);
                                var tmp2 = Number(obj3[i].total_hours);
                                //console.log(' sum1=' + tmp1 + ' sum2=' + tmp2);
                                var tmp_sum = tmp1 + tmp2;
                                tmp_sum = tmp_sum.toFixed(2);
                                tmpVrijeme = time_convert(60 * tmp_sum);

                                //console.log(tmp_sum)
                                mySum[index].total_hours = tmp_sum;
                                mySum[index].total_hours2 = tmpVrijeme;
                            }
                            //console.log(array); // same myArray object 3 times
                        });

                        mySum[obj3[i].naziv] = mySum[obj3[i].naziv] + obj3[i].total_hours;
                        //console.log(count2++ + ' nije pushan object5 ');
                    } else {
                        //console.log(count2++ + ' nisam nasao ' + obj3[i].naziv);
                        //console.log(count2++ + ' pushan object5 ');
                        mySum.push(obj5);
                    }
                    //console.log(' sadržaj arrajy sume je je ' + mySum[0].title);
                }


                //console.log(' sadržaj arrajy je ' + mySum[0].title);

                const viewModel = fromObject({
                    myTitles,
                    mySum
                });

                page.bindingContext = viewModel;

            }


        }).catch((err) => {
            console.log(err);
        });


}
exports.buttonTap = buttonTap;

function time_convert(num) {
    var hours = Math.floor(num / 60);
    var minutes = num % 60;
    var ukupno = hours + (num % 60) / 100;
    return ukupno.toFixed(2);
    //return `${hours}.${minutes}`;
    //return `${hours}.${minutes}`;
}


function inArrayOfObjects(myArray, myValue, objElement) {
    var inArray = false;
    myArray.map(function (arrayObj) {
        if (arrayObj[objElement] === myValue) {
            inArray = true;
        }
    });
    return inArray;
};

