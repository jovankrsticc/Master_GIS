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

    var osnovniSloj = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png?{foo}', {foo: 'bar', attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);

    layerControl.addBaseLayer(osnovniSloj, "OsnovniSloj").addTo(map);
    

    getData();

    map.eachLayer(function(layer){
		
		console.log(layer);
	});
    
}

function getData(){
	$.ajax("getData.php", {
		data: {
			table: "korisnici",
            trajvozilo: "veh3",
		},
		success: function(data){
			console.log(data);
            mapData(data);
		}
	})
};

function mapData(data){
	
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
				fillColor: "#CC9900",
				color: "#FFF",
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
    layerControl.addOverlay(mapDataLayer, "Trajektorija").addTo(map);
};


function iscrtajtrajektorijuvozila()
{
    var formdata = $("form").serializeArray();

    var Vozilo= formdata[0].value;
    
    $.ajax("getData.php", {
		data: {
			table: "korisnici",
            trajvozilo: Vozilo,
		},
		success: function(data){
			console.log(data);
            mapData(data);
		}
	})

}