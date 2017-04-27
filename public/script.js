window.addEventListener('load', () => {

  //Use Geolocation API to determine where we address
  if('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      d3.select('body')
        .insert('div', ':first-child')
        .attr("class", "location-bar")
        .text("You are at: " + position.coords.latitude + ", " + position.coords.longitude);
      console.log(position);
    });
  }

  //Build a table for our location data
  d3.json('/locations.json', (err, locations) => {
    if(err) return console.log(err);

    //Create Table
    var table = d3.select('body').append('table');

    //Create Table Header
    table.append('thead')
        .append('tr')
        .selectAll('th')
        .data(['address', 'latitude', 'longitude'])
        .enter()
        .append('th')
        .text((d) => { return d; });

    //Create Table body
    table.append('tbody')
        .selectAll('tr')
        .data(locations)
        .enter()
        .append('tr')
        .each(function(d) {
          d3.select(this).append('td').text(d.address);
          d3.select(this).append('td').text(d.latitude);
          d3.select(this).append('td').text(d.longitude);
        });
  });

  //Draw a map with our locations marked with pins
  d3.json('/united-states.json', function(err, usa) {
    if(err) return console.log(err);

    //Set width and height
    var width = 760;
    var height = 480;

    //Create an SVG to render into
    var svg = d3.select('body')
      .append('svg')
      .attr("width", width)
      .attr("height", height);

    //Create a projection to translate lat/lng pairs
    //into x, y cooredinates
    var projection = d3.geoAlbersUsa()
                        .scale(1000)
                        .translate([width/2, height/2]);

    //Set geopaths to use the projection
    var path = d3.geoPath().projection(projection);

    //Draw land borders
    svg.insert('path', '.land-borders')
      .datum(topojson.feature(usa, usa.objects.land))
      .attr('class', 'land')
      .attr('d', path);

    //Draw state borders
    svg.insert('path', '.state-borders')
      .datum(topojson.feature(usa, usa.objects.states))
      .attr('class', 'state')
      .attr('d', path);

    //Mark all locations
    d3.json('/locations.json', function(err, locations) {
      if(err) return console.log(err);

      //Draw map pin
      svg.selectAll('.pin')
        .data(locations)
        .enter()
        .append('image')
        .attr('xlink:href', 'pin.png')
        .attr('class', 'pin')
        .attr('width', 20)
        .attr('height', 20)
        .attr('transform', function(d) {

          var coords = [d.latitude, d.longitude]
          coords = projection(coords);
          coords[0] -= 10;
          coords[1] -= 10;
          return 'translate(' + coords + ')';
        })
        .append("svg:title")
        .text(function(d) {
          return d.address;
        });
    });
  });
});
