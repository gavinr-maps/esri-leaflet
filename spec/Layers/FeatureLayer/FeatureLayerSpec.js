/* eslint-env mocha */

describe("L.esri.FeatureLayer", () => {
  function createMap() {
    // create container
    const container = document.createElement("div");

    // give container a width/height
    container.setAttribute("style", "width:500px; height: 500px;");

    // add contianer to body
    document.body.appendChild(container);

    return L.map(container, {
      minZoom: 1,
      maxZoom: 19,
      // trackResize: false
    }).setView([45.51, -122.66], 5);
  }

  let layer;
  const map = createMap();
  const features = [
    {
      type: "Feature",
      id: 1,
      geometry: {
        type: "LineString",
        coordinates: [
          [-122, 45],
          [-121, 40],
        ],
      },
      properties: {
        time: new Date("January 1 2014").valueOf(),
        type: "good",
      },
    },
    {
      type: "Feature",
      id: 2,
      geometry: {
        type: "LineString",
        coordinates: [
          [-123, 46],
          [-120, 45],
        ],
      },
      properties: {
        time: new Date("Febuary 1 2014").valueOf(),
        type: "bad",
      },
    },
  ];

  const multiPolygon = [
    {
      type: "Feature",
      id: 1,
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          [
            [
              [-95, 43],
              [-95, 50],
              [-90, 50],
              [-91, 42],
              [-95, 43],
            ],
          ],
          [
            [
              [-89, 42],
              [-89, 50],
              [-80, 50],
              [-80, 42],
            ],
          ],
        ],
      },
      properties: {
        time: new Date("Febuary 1 2014").valueOf(),
      },
    },
  ];

  const point = [
    {
      type: "Feature",
      id: 1,
      geometry: {
        type: "Point",
        coordinates: [-95, 43],
      },
      properties: {
        time: new Date("Febuary 1 2014").valueOf(),
      },
    },
  ];

  beforeEach(() => {
    L.Icon.Default.imagePath = "https://unpkg.com/leaflet/dist/images/";

    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        timeField: "time",
        pointToLayer(feature, latlng) {
          return L.circleMarker(latlng, {
            color: "green",
          });
        },
      })
      .addTo(map);

    layer.createLayers(features);
  });

  it("should fire a createfeature event", (done) => {
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        timeField: "time",
        pointToLayer(feature, latlng) {
          return L.circleMarker(latlng);
        },
      })
      .addTo(map);

    layer.on("createfeature", (e) => {
      expect(e.feature.id).to.equal(2);
      done();
    });

    layer.createLayers(features);
  });

  it("should have an alias at L.esri.featureLayer", () => {
    const layer = L.esri.featureLayer({
      url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
    });
    expect(layer).to.be.an.instanceof(L.esri.FeatureLayer);
  });

  it("should store additional params passed in url", () => {
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0?foo=bar",
      })
      .addTo(map);

    expect(layer.options.requestParams).to.deep.equal({ foo: "bar" });
    expect(layer.options.url).to.deep.equal(
      "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0/",
    );
  });

  it("should create features on a map", () => {
    expect(map.hasLayer(layer.getFeature(1))).to.equal(true);
    expect(map.hasLayer(layer.getFeature(2))).to.equal(true);
  });

  it("should remove features on a map", () => {
    layer.removeLayers([1]);
    expect(map.hasLayer(layer.getFeature(1))).to.equal(false);
    expect(map.hasLayer(layer.getFeature(2))).to.equal(true);
  });

  it("should fire a removefeature event", () => {
    layer.on("removefeature", (e) => {
      expect(e.feature.id).to.equal(1);
    });
    layer.removeLayers([1]);
  });

  it("should fire a removefeature event when the featureLayer is removed from the map", (done) => {
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        timeField: "time",
        pointToLayer(feature, latlng) {
          return L.circleMarker(latlng);
        },
      })
      .addTo(map);

    layer.createLayers(features);

    layer.on("removefeature", (e) => {
      expect(e.feature.id).to.equal(1);
      done();
    });

    map.removeLayer(layer);
  });

  it("should add features back to a map", () => {
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        timeField: "time",
        pointToLayer(feature, latlng) {
          return L.circleMarker(latlng, {
            color: "green",
          });
        },
      })
      .addTo(map);

    const createSpy = sinon.spy();
    layer.on("createfeature", createSpy);

    const removeSpy = sinon.spy();
    layer.on("removefeature", removeSpy);

    layer.createLayers(features);
    layer.removeLayers([1, 2]);
    layer.addLayers([1]);

    expect(map.hasLayer(layer.getFeature(1))).to.equal(true);
    expect(map.hasLayer(layer.getFeature(2))).to.equal(false);
    expect(createSpy.callCount).to.equal(2);
    expect(removeSpy.callCount).to.equal(2);
  });

  it("should fire a addfeature event", () => {
    layer.on("addfeature", (e) => {
      expect(e.feature.id).to.equal(1);
    });
    layer.removeLayers([1]);
    layer.addLayers([1]);
  });

  it("should fire an addfeature event when a featureLayer is readded to the map", (done) => {
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        timeField: "time",
        pointToLayer(feature, latlng) {
          return L.circleMarker(latlng);
        },
      })
      .addTo(map);

    layer.createLayers(features);
    map.removeLayer(layer);

    layer.on("addfeature", (e) => {
      expect(e.feature.id).to.equal(2);
      done();
    });

    map.addLayer(layer);
    layer.createLayers(features);
  });

  it("should not add features outside the time range", () => {
    layer.setTimeRange(new Date("January 1 2014"), new Date("Febuary 1 2014"));

    layer.createLayers([
      {
        type: "Feature",
        id: 3,
        geometry: {
          type: "Point",
          coordinates: [-123, 47],
        },
        properties: {
          time: new Date("March 1 2014").valueOf(),
        },
      },
    ]);

    expect(map.hasLayer(layer.getFeature(1))).to.equal(true);
    expect(map.hasLayer(layer.getFeature(2))).to.equal(true);
    expect(map.hasLayer(layer.getFeature(3))).to.equal(false);
  });

  it("should be able to add itself to a map", () => {
    layer.addTo(map);

    expect(map.hasLayer(layer)).to.equal(true);
  });

  it("should be remove itself from a map", () => {
    layer.addTo(map);
    map.removeLayer(layer);

    expect(map.hasLayer(layer)).to.equal(false);
  });

  it("should iterate over each feature", () => {
    const spy = sinon.spy();
    layer.eachFeature(spy);
    expect(spy.callCount).to.equal(2);
  });

  it("should iterate over each active polyline/polygon feature", () => {
    // manually push features into cache, since they werent injected via a service response
    layer._currentSnapshot.push(1);
    layer._currentSnapshot.push(2);

    const spy = sinon.spy();
    layer.eachActiveFeature(spy);
    expect(spy.callCount).to.equal(2);
  });

  it("should iterate over each active point feature", () => {
    const spy = sinon.spy();
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
      })
      .addTo(map);
    layer.createLayers(point);
    layer._currentSnapshot.push(1);
    layer.eachActiveFeature(spy);
    // because point is outside current map extent
    expect(spy.callCount).to.equal(0);
  });

  it("should run a function against every feature", () => {
    const spy = sinon.spy();
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        onEachFeature: spy,
      })
      .addTo(map);
    layer.createLayers(features);
    expect(spy.callCount).to.equal(2);
  });

  it("should style L.circleMarker features appropriately", () => {
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        timeField: "time",
        pointToLayer(feature, latlng) {
          return L.circleMarker(latlng, {
            color: "green",
          });
        },
      })
      .addTo(map);

    layer.createLayers(point);
    expect(layer.getFeature(1).options.color).to.equal("green");
  });

  it("should unbind popups on features", () => {
    layer.bindPopup((feature) => `ID: ${feature.id}`);

    layer.unbindPopup();

    expect(layer._popup).to.equal(null);
    expect(layer._popup).to.equal(null);
  });

  it("should unbind popups on multi polygon features", () => {
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        timeField: "time",
      })
      .addTo(map);

    layer.createLayers(multiPolygon);

    layer.bindPopup((feature) => `ID: ${feature.id}`);

    layer.unbindPopup();

    expect(layer._popup).to.equal(null);
  });

  it("should reset style on multi polygon features", () => {
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        style: {
          color: "black",
        },
      })
      .addTo(map);

    layer.createLayers(multiPolygon);

    expect(layer.getFeature(1).options.color).to.equal("black");

    layer.setFeatureStyle(1, {
      color: "red",
    });

    expect(layer.getFeature(1).options.color).to.equal("red");

    layer.resetStyle(1);

    expect(layer.getFeature(1).options.color).to.equal("black");
  });

  it("should reset L.circleMarker style", () => {
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        pointToLayer(feature, latlng) {
          return L.circleMarker(latlng);
        },
        style() {
          return {
            color: "green",
          };
        },
      })
      .addTo(map);

    layer.createLayers(point);
    expect(layer.getFeature(1).options.color).to.equal("green");

    layer.setStyle({
      color: "red",
    });
    expect(layer.getFeature(1).options.color).to.equal("red");

    layer.resetFeatureStyle(1);
    expect(layer.getFeature(1).options.color).to.equal("green");
  });

  it("should reset to default style on multi polygon features", () => {
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
      })
      .addTo(map);

    layer.createLayers(multiPolygon);

    layer.setFeatureStyle(1, {
      color: "red",
    });

    expect(layer.getFeature(1).options.color).to.equal("red");

    layer.resetStyle(1);

    expect(layer.getFeature(1).options.color).to.equal("#3388ff");
  });

  it("should draw multi polygon features with a fill", () => {
    layer = L.esri
      .featureLayer({
        url: "http://services.arcgis.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
      })
      .addTo(map);

    layer.createLayers(multiPolygon);

    expect(layer.getFeature(1).options.fill).to.equal(true);

    layer.resetStyle(1);

    expect(layer.getFeature(1).options.color).to.equal("#3388ff");
  });

  it("should iterate over each feature", () => {
    const spy = sinon.spy();
    layer.eachFeature(spy);
    expect(spy.callCount).to.equal(2);
  });

  it("should run a function against every feature", () => {
    const spy = sinon.spy();
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        onEachFeature: spy,
      })
      .addTo(map);
    layer.createLayers(features);
    expect(spy.callCount).to.equal(2);
  });

  it("should change styles on features with an object", () => {
    layer.setStyle({
      color: "red",
    });

    expect(layer.getFeature(1).options.color).to.equal("red");
    expect(layer.getFeature(2).options.color).to.equal("red");

    layer.createLayers([
      {
        type: "Feature",
        id: 3,
        geometry: {
          type: "LineString",
          coordinates: [
            [-122, 45],
            [-121, 63],
          ],
        },
        properties: {
          time: new Date("Febuary 24 2014").valueOf(),
        },
      },
    ]);

    expect(layer.getFeature(3).options.color).to.equal("red");
  });

  it("should change styles on features with a function", () => {
    layer.setStyle(() => ({
      color: "red",
    }));

    expect(layer.getFeature(1).options.color).to.equal("red");
    expect(layer.getFeature(2).options.color).to.equal("red");

    layer.createLayers([
      {
        type: "Feature",
        id: 3,
        geometry: {
          type: "LineString",
          coordinates: [
            [-122, 45],
            [-121, 63],
          ],
        },
        properties: {
          time: new Date("Febuary 24 2014").valueOf(),
        },
      },
    ]);

    expect(layer.getFeature(3).options.color).to.equal("red");
  });

  it("should propagate events from individual features", () => {
    const spy = sinon.spy();
    layer.on("click", spy);

    layer.getFeature(1).fire(
      "click",
      {
        foo: "bar",
      },
      true,
    );

    expect(spy.getCall(0).args[0].foo).to.equal("bar");
    expect(spy.getCall(0).args[0].type).to.equal("click");
  });

  it("should pass renderer through to individual features", () => {
    const renderer = L.canvas();
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        renderer,
      })
      .addTo(map);

    layer.createLayers(features);

    expect(layer.getFeature(1).options.renderer).to.equal(renderer);
  });

  it("should pass pane through to individual features", () => {
    map.createPane("custom");
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        pane: "custom",
      })
      .addTo(map);

    layer.createLayers(features);

    expect(layer.getFeature(1).options.pane).to.equal("custom");
  });

  it("should not throw uncaught errors when a feature layer is removed from the map", () => {
    map.createPane("custom");
    layer = L.esri
      .featureLayer({
        url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
        pane: "custom",
      })
      .addTo(map);

    layer.createLayers(features);
    expect(layer._map).to.equal(map);

    map.removeLayer(layer);
    expect(layer._map).to.not.exist;
  });

  it("should set the timeout of the service in two different ways", () => {
    map.createPane("custom");
    layer = L.esri.featureLayer({
      url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
      pane: "custom",
    });
    expect(layer.service.options.timeout).to.equal(0);

    layer.service.setTimeout(1500);
    expect(layer.service.options.timeout).to.equal(1500);

    const layer2 = L.esri.featureLayer({
      url: "http://gis.example.com/mock/arcgis/rest/services/MockService/MockFeatureServer/0",
      pane: "custom",
      timeout: 1500,
    });
    expect(layer2.service.options.timeout).to.equal(1500);
  });
});
