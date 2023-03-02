$(document).ready(initialize);
//"userid","t","brzina"
var map,
	fields = [], 
	autocomplete = [];



var layerControl = new L.control.layers();
function initialize(){
    $("#map").height($(window).height());

    map = L.map('map', {
        center: [43.310137,21.879554 ],
        zoom: 13
    });

    var wmsLayer = L.tileLayer.wms('http://localhost:8080/geoserver/Mobtest/wms?', {
        layers: 'Mobtest:planet_osm_line'
    }).addTo(map);
    
    layerControl.addBaseLayer(wmsLayer, "Putevi").addTo(map);

    var osnovniSloj = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

    layerControl.addBaseLayer(osnovniSloj, "OsnovniSloj").addTo(map);
    
    
    fileSelector()

    getData();
    
}

function fileSelector()
{
    $.ajax("getSvaVozila.php", {
		success: function(data){
            var dataArray =data.split(", ;");
            dataArray.forEach(function(item){
                $('#select1').append(`<option value="${item}">
                                       ${item}
                                  </option>`);
            });
			//console.log(data.split(", ;"));
		}
	})
}
function ZumirajVozilo(ve)
{
    $.ajax("getPointEndVozilo.php", {
        data: {
            vozilo: ve,
        },
		success: function(data){
			//console.log($.parseJSON(data.split(", ")[1]).coordinates);
            var cord = $.parseJSON(data.split(", ")[1]).coordinates;
            var latlon=[cord[1],cord[0]];
            map.setView(latlon, 15);
		}
	})
}

function getData(){
	$.ajax("getData.php", {
		data: {
			table: "korisnici",
            trajvozilo: "veh3",
		},
		success: function(data){
			//console.log(data);
            mapData(data,"veh3");
		}
	})
};

function mapData(data,vozilo){
	
	map.eachLayer(function(layer){
		
		if (typeof layer._url === "undefined"){
			map.removeLayer(layer);
		}
	});

	
	var geojson = {
		"type": "FeatureCollection",
		"features": []
	};


	var dataArray = data.split(", ;");
	dataArray.pop();
    
    //console.log(dataArray);
	

	dataArray.forEach(function(d){
		d = d.split(", "); 

		
		var feature = {
			"type": "Feature",
			"properties": {}, 
			"geometry": JSON.parse(d[fields.length]) 
		};

		for (var i=0; i<fields.length; i++){
			feature.properties[fields[i]] = d[i];
		};


		geojson.features.push(feature);
	});
	
    //console.log(geojson);
    

	var mapDataLayer = L.geoJson(geojson, {
		pointToLayer: function (feature, latlng) {
			var markerStyle = { 
				fillColor: "#FFFFFF",
				color: "#FFFFFF",
				fillOpacity: 0.5,
				opacity: 0.8,
				weight: 1,
				radius: 8
			};

			return L.circleMarker(latlng, markerStyle);
		},
		onEachFeature: function (feature, layer) {
			var html = "";
            //console.log(feature.properties)
			for (var prop in feature.properties){
				html += prop+": "+feature.properties[prop]+"<br>";
			};
	        layer.bindPopup(html);
	    }
	}).addTo(map);

    mapDataLayer.setStyle({
        fillColor: "#FF0000",
		color: "#FF0000",
    });
    layerControl.addOverlay(mapDataLayer, "Trajektorija "+vozilo).addTo(map);
};


function PocetakiKrajKretanja(Vozilo)
{
    
    $.ajax("getPocetakiKrajKretanaj.php", {
		data: {
            vozilo: Vozilo,
		},
		success: function(data){
			console.log(data.split(", ;")[0]);
            $("#PocetakKret").val(data.split(", ;")[1]);
            $("#KrajKret").val(data.split(", ;")[0]);
		}
	})
}

function iscrtajtrajektorijuvozila()
{
    var Vozilo= $('#select1').val();
    console.log(Vozilo);
    
    $.ajax("getData.php", {
		data: {
			table: "korisnici",
            trajvozilo: Vozilo,
		},
		success: function(data){
			console.log(data);
            mapData(data,Vozilo);
		}
	})
    PocetakiKrajKretanja(Vozilo);
    ZumirajVozilo(Vozilo);
}


function iscrtajtrajektorijuvozilauvremenu()
{
    var Vozilo= $('#select1').val();
    var Pocetakk= $("#PocetakKret").val().replace("T"," ");
    if(Pocetakk.length<18){Pocetakk+":00"}
    var Krajk=$("#KrajKret").val().replace("T"," ");
    if(Krajk.length<18){Krajk+":00"}

    
    $.ajax("getVozilouvremenu.php", {
		data: {
			table: "korisnici",
            trajvozilo: Vozilo,
            pocetak:Pocetakk,
            kraj:Krajk
		},
		success: function(data){
			console.log(data);
            mapData(data,Vozilo);
		}
	})
    ZumirajVozilo(Vozilo);
}

function prosecnabrzina()
{
    var Pocetakk= $("#PocetakKret1").val().replace("T"," ");
    if(Pocetakk.length<18){Pocetakk+":00"}
    var Krajk=$("#KrajKret1").val().replace("T"," ");
    if(Krajk.length<18){Krajk+":00"}
    var brzpros=$("#prosbrzina").val();

    $.ajax("getProsecnabrzinaveca.php", {
		data: {
			table: "korisnici",
            pocetak:Pocetakk,
            kraj:Krajk,
            brzina:brzpros
		},
		success: function(data){
			console.log(data);
            mapData(data,"Prosek_"+brzpros);
		}
	})
   
}