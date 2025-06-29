/* eslint-env mocha */

describe("L.esri.Query", () => {
  function createMap() {
    // create container
    const container = document.createElement("div");

    // give container a width/height
    container.setAttribute("style", "width:500px; height: 500px;");

    // add contianer to body
    document.body.appendChild(container);

    return L.map(container).setView([45.51, -122.66], 16);
  }

  const map = createMap();

  let server;
  let task;

  const bounds = L.latLngBounds([
    [45.5, -122.66],
    [45.51, -122.65],
  ]);
  const latlng = L.latLng(45.51, -122.66);

  const rawGeoJsonPolygon = {
    type: "Polygon",
    coordinates: [
      [
        [-97, 39],
        [-97, 41],
        [-94, 41],
        [-94, 39],
        [-97, 39],
      ],
    ],
  };

  const rawGeoJsonMultiPolygon = {
    type: "MultiPolygon",
    coordinates: [
      [
        [
          [-97, 39],
          [-97, 41],
          [-94, 41],
          [-94, 39],
          [-97, 39],
        ],
      ],
      [
        [
          [-96, 39.5],
          [-96, 40.5],
          [-95, 40.5],
          [-95, 39.5],
          [-96, 39.5],
        ],
      ],
    ],
  };

  const rawGeoJsonFeature = { type: "Feature" };
  rawGeoJsonFeature.geometry = rawGeoJsonPolygon;

  const geoJsonPolygon = L.geoJSON(rawGeoJsonPolygon);

  const featureLayerUrl =
    "http://gis.example.com/mock/arcgis/rest/services/MockFeatureService/FeatureServer/0/";
  const mapServiceUrl =
    "http://gis.example.com/mock/arcgis/rest/services/MockMapService/MapServer/";
  const imageServiceUrl =
    "http://gis.example.com/mock/arcgis/rest/services/MockImageService/ImageServer/";

  const sampleImageServiceQueryResponse = {
    fieldAliases: {
      IMAGEID: "IMAGEID",
      OWNER: "OWNER",
    },
    fields: [
      {
        name: "IMAGEID",
        type: "esriFieldTypeOID",
        alias: "IMAGEID",
      },
      {
        name: "OWNER",
        type: "esriFieldTypeString",
        alias: "OWNER",
      },
    ],
    features: [
      {
        attributes: {
          IMAGEID: 1,
          OWNER: "Joe Smith",
        },
        geometry: {
          rings: [
            [
              [-97.06138, 32.837],
              [-97.06133, 32.836],
              [-97.06124, 32.834],
              [-97.06127, 32.832],
              [-97.06138, 32.837],
            ],
          ],
          spatialReference: {
            wkid: 4326,
          },
        },
      },
    ],
  };

  const sampleImageServiceCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-97.06138, 32.837],
              [-97.06127, 32.832],
              [-97.06124, 32.834],
              [-97.06133, 32.836],
              [-97.06138, 32.837],
            ],
          ],
        },
        properties: {
          IMAGEID: 1,
          OWNER: "Joe Smith",
        },
        id: 1,
      },
    ],
  };

  const sampleMapServiceQueryResponse = {
    fieldAliases: {
      ObjectID: "ObjectID",
      Name: "Name",
    },
    fields: [
      {
        name: "ObjectID",
        type: "esriFieldTypeOID",
        alias: "ObjectID",
      },
      {
        name: "Name",
        type: "esriFieldTypeString",
        alias: "Name",
      },
    ],
    features: [
      {
        attributes: {
          ObjectID: 1,
          Name: "Site",
        },
        geometry: {
          x: -122.81,
          y: 45.48,
          spatialReference: {
            wkid: 4326,
          },
        },
      },
    ],
  };

  const sampleMapServiceCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-122.81, 45.48],
        },
        properties: {
          ObjectID: 1,
          Name: "Site",
        },
        id: 1,
      },
    ],
  };

  const sampleQueryResponse = {
    objectIdFieldName: "FID",
    fields: [
      {
        name: "stop_desc",
        type: "esriFieldTypeString",
        alias: "stop_desc",
        sqlType: "sqlTypeNVarchar",
        length: 256,
        domain: null,
        defaultValue: null,
      },
      {
        name: "FID",
        type: "esriFieldTypeInteger",
        alias: "FID",
        sqlType: "sqlTypeInteger",
        domain: null,
        defaultValue: null,
      },
    ],
    features: [
      {
        attributes: {
          FID: 1,
          Name: "Site",
        },
        geometry: {
          x: -122.81,
          y: 45.48,
          spatialReference: {
            wkid: 4326,
          },
        },
      },
    ],
  };

  const sampleExtentResponse = {
    extent: {
      xmin: -122.66,
      ymin: 45.5,
      xmax: -122.65,
      ymax: 45.51,
    },
  };

  // this is how ArcGIS Server returns a null extent (for now)
  const sampleNaNExtentResponse = {
    extent: {
      xmin: "NaN",
      ymin: "NaN",
      xmax: "NaN",
      ymax: "NaN",
    },
  };

  const sampleCountResponse = {
    count: 1,
  };

  const sampleFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [-122.81, 45.48],
        },
        properties: {
          FID: 1,
          Name: "Site",
        },
        id: 1,
      },
    ],
  };

  const sampleDistinctFeatureCollection = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: null,
        properties: {
          FID: 1,
          Name: "Site",
        },
        id: 1,
      },
    ],
  };

  const sampleIdsResponse = {
    objectIdFieldName: "FID",
    objectIds: [1, 2],
  };

  const sampleDistinctQueryResponse = {
    objectIdFieldName: "FID",
    fields: [
      {
        name: "stop_desc",
        type: "esriFieldTypeString",
        alias: "stop_desc",
        sqlType: "sqlTypeNVarchar",
        length: 256,
        domain: null,
        defaultValue: null,
      },
      {
        name: "FID",
        type: "esriFieldTypeInteger",
        alias: "FID",
        sqlType: "sqlTypeInteger",
        domain: null,
        defaultValue: null,
      },
    ],
    features: [
      {
        attributes: {
          FID: 1,
          Name: "Site",
        },
        geometry: null,
      },
    ],
  };

  const dumbLongQuery =
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters" +
    "this is a dumb way to make sure the request is more than 2000 characters";

  beforeEach(() => {
    server = sinon.fakeServer.create();
    task = L.esri.query({ url: featureLayerUrl });
  });

  afterEach(() => {
    server.restore();
  });

  it("should query features", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    const request = task.run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    expect(request).to.be.an.instanceof(XMLHttpRequest);

    server.respond();
  });

  it("should send requests for M values in response geometry", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&returnM=false&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.returnM(false);
    const request = task.run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    expect(request).to.be.an.instanceof(XMLHttpRequest);

    server.respond();
  });

  it("should query features within bounds", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22xmin%22%3A-122.66%2C%22ymin%22%3A45.5%2C%22xmax%22%3A-122.65%2C%22ymax%22%3A45.51%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelContains&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.within(bounds).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features within geojson geometry", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelContains&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.within(rawGeoJsonPolygon).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features within a geojson multipolygon geometry", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%2C%5B%5B-96%2C39.5%5D%2C%5B-96%2C40.5%5D%2C%5B-95%2C40.5%5D%2C%5B-95%2C39.5%5D%2C%5B-96%2C39.5%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelContains&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.within(rawGeoJsonMultiPolygon).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features within geojson feature", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelContains&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.within(rawGeoJsonFeature).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features within leaflet geojson object", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelContains&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.within(geoJsonPolygon).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that intersect bounds", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22xmin%22%3A-122.66%2C%22ymin%22%3A45.5%2C%22xmax%22%3A-122.65%2C%22ymax%22%3A45.51%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelIntersects&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.intersects(bounds).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that intersect geojson geometry", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelIntersects&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.intersects(rawGeoJsonPolygon).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that intersect geojson feature", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelIntersects&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.intersects(rawGeoJsonFeature).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that intersect leaflet geojson object", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelIntersects&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.intersects(geoJsonPolygon).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that contain bounds", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22xmin%22%3A-122.66%2C%22ymin%22%3A45.5%2C%22xmax%22%3A-122.65%2C%22ymax%22%3A45.51%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelWithin&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.contains(bounds).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that contain geojson geometry", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelWithin&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.contains(rawGeoJsonPolygon).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that contain geojson feature", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelWithin&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.contains(rawGeoJsonFeature).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that contain leaflet geojson object", (done) => {
    //                                           query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelWithin&f=json
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelWithin&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.contains(geoJsonPolygon).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that overlap bounds", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22xmin%22%3A-122.66%2C%22ymin%22%3A45.5%2C%22xmax%22%3A-122.65%2C%22ymax%22%3A45.51%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryEnvelope&spatialRel=esriSpatialRelOverlaps&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.overlaps(bounds).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that overlap geojson geometry", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelOverlaps&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.overlaps(rawGeoJsonPolygon).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that overlap geojson feature", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelOverlaps&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.overlaps(rawGeoJsonFeature).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that overlap leaflet geojson object", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelOverlaps&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.overlaps(geoJsonPolygon).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features near a latlng", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&geometry=-122.66%2C45.51&geometryType=esriGeometryPoint&spatialRel=esriSpatialRelIntersects&units=esriSRUnit_Meter&distance=500&inSR=4326&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.nearby(latlng, 500).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features that have intersecting envelopes", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&inSR=4326&geometry=%7B%22rings%22%3A%5B%5B%5B-97%2C39%5D%2C%5B-97%2C41%5D%2C%5B-94%2C41%5D%2C%5B-94%2C39%5D%2C%5B-97%2C39%5D%5D%5D%2C%22spatialReference%22%3A%7B%22wkid%22%3A4326%7D%7D&geometryType=esriGeometryPolygon&spatialRel=esriSpatialRelEnvelopeIntersects&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.bboxIntersects(geoJsonPolygon).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features with a where option", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=NAME%3D%27Site%27&outSR=4326&outFields=*&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.where("NAME='Site'").run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should limit queries for pagination", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&resultRecordCount=10&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.limit(10).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should offset queries for pagination", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&resultOffset=10&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.offset(10).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query features in a given time range", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&time=1357027200000%2C1388563200000&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    const start = new Date("January 1 2013 GMT-0800");
    const end = new Date("January 1 2014 GMT-0800");

    task.between(start, end).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should set output fields for queries", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=Name%2CFID&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.fields(["Name", "FID"]).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should limit geometry percision", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&geometryPrecision=4&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.precision(4).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should identify features and simplify geometries", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&maxAllowableOffset=0.000010728836059570312&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.simplify(map, 0.5).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should order query output ascending", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&orderByFields=Name%20ASC&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.orderBy("Name").run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should order query output descending", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&orderByFields=Name%20DESC&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.orderBy("Name", "DESC").run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should order query output with multiple features", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&orderByFields=Name%20DESC%2CScore%20ASC&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task
      .orderBy("Name", "DESC")
      .orderBy("Score", "ASC")
      .run((error, featureCollection, raw) => {
        expect(featureCollection).to.deep.equal(sampleFeatureCollection);
        expect(raw).to.deep.equal(sampleQueryResponse);
        done();
      });

    server.respond();
  });

  it("should be able to query specific feature ids", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&objectIds=1%2C2&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.featureIds([1, 2]).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should be able to query token", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&token=foo&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.token("foo").run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should be able to query apikey", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&token=foo&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    task.apikey("foo").run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    server.respond();
  });

  it("should query bounds", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&returnExtentOnly=true&f=json`,
      JSON.stringify(sampleExtentResponse),
    );

    const request = task.bounds((error, latlngbounds, raw) => {
      expect(latlngbounds).to.deep.equal(bounds);
      expect(raw).to.deep.equal(sampleExtentResponse);
      done();
    });

    expect(request).to.be.an.instanceof(XMLHttpRequest);

    server.respond();
  });

  it("should query nullified bounds", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D2&outSR=4326&outFields=*&returnExtentOnly=true&f=json`,
      JSON.stringify(sampleNaNExtentResponse),
    );

    task.where("1=2");
    const request = task.bounds((error, latlngbounds, raw) => {
      expect(error.message).to.equal("Invalid Bounds");
      expect(latlngbounds).to.deep.equal(null);
      expect(raw).to.deep.equal(sampleNaNExtentResponse);
      done();
    });

    expect(request).to.be.an.instanceof(XMLHttpRequest);

    server.respond();
    task.where("1=1");
  });

  it("should query count", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&returnCountOnly=true&f=json`,
      JSON.stringify(sampleCountResponse),
    );

    const request = task.count((error, count, raw) => {
      expect(count).to.equal(1);
      expect(raw).to.deep.equal(sampleCountResponse);
      done();
    });

    expect(request).to.be.an.instanceof(XMLHttpRequest);

    server.respond();
  });

  it("should query ids", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&returnIdsOnly=true&f=json`,
      JSON.stringify(sampleIdsResponse),
    );

    const request = task.ids((error, ids, raw) => {
      expect(ids).to.deep.equal([1, 2]);
      expect(raw).to.deep.equal(sampleIdsResponse);
      done();
    });

    expect(request).to.be.an.instanceof(XMLHttpRequest);

    server.respond();
  });

  it("should query distinct", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=false&where=1%3D1&outSR=4326&outFields=*&returnDistinctValues=true&f=json`,
      JSON.stringify(sampleDistinctQueryResponse),
    );

    const request = task.distinct(true).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleDistinctFeatureCollection);
      expect(raw).to.deep.equal(sampleDistinctQueryResponse);
      done();
    });

    expect(request).to.be.an.instanceof(XMLHttpRequest);

    server.respond();
  });

  it("should use a feature layer service to query features", (done) => {
    server.respondWith(
      "GET",
      `${featureLayerUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&f=json`,
      JSON.stringify(sampleQueryResponse),
    );

    const service = new L.esri.FeatureLayerService({ url: featureLayerUrl });

    const request = service.query().run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleQueryResponse);
      done();
    });

    expect(request).to.be.an.instanceof(XMLHttpRequest);

    server.respond();
  });

  it("should use a map service to query features", (done) => {
    server.respondWith(
      "GET",
      `${mapServiceUrl}0/query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&f=json`,
      JSON.stringify(sampleMapServiceQueryResponse),
    );

    const service = new L.esri.MapService({ url: mapServiceUrl });

    service
      .query()
      .layer(0)
      .run((error, featureCollection, raw) => {
        expect(featureCollection).to.deep.equal(sampleMapServiceCollection);
        expect(raw).to.deep.equal(sampleMapServiceQueryResponse);
        done();
      });

    server.respond();
  });

  it("should pass through a simple datum transformation when making a query", (done) => {
    server.respondWith(
      "GET",
      `${mapServiceUrl}0/query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&datumTransformation=1234&f=json`,
      JSON.stringify(sampleMapServiceQueryResponse),
    );

    const service = new L.esri.MapService({ url: mapServiceUrl });

    service
      .query()
      .layer(0)
      .transform(1234)
      .run((error, featureCollection, raw) => {
        expect(featureCollection).to.deep.equal(sampleMapServiceCollection);
        expect(raw).to.deep.equal(sampleMapServiceQueryResponse);
        done();
      });

    server.respond();
  });

  it("should pass through a JSON datum transformation when making a query", (done) => {
    server.respondWith(
      "GET",
      `${mapServiceUrl}0/query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&datumTransformation=%7B%22wkid%22%3A1234%7D&f=json`,
      JSON.stringify(sampleMapServiceQueryResponse),
    );

    const service = new L.esri.MapService({ url: mapServiceUrl });

    service
      .query()
      .layer(0)
      .transform({ wkid: 1234 })
      .run((error, featureCollection, raw) => {
        expect(featureCollection).to.deep.equal(sampleMapServiceCollection);
        expect(raw).to.deep.equal(sampleMapServiceQueryResponse);
        done();
      });

    server.respond();
  });

  it("should use a image service to query features", (done) => {
    server.respondWith(
      "GET",
      `${imageServiceUrl}query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&pixelSize=1%2C1&f=json`,
      JSON.stringify(sampleImageServiceQueryResponse),
    );

    const service = new L.esri.MapService({ url: imageServiceUrl });

    const request = service
      .query()
      .pixelSize([1, 1])
      .run((error, featureCollection, raw) => {
        expect(featureCollection).to.deep.equal(sampleImageServiceCollection);
        expect(raw).to.deep.equal(sampleImageServiceQueryResponse);
        done();
      });

    expect(request).to.be.an.instanceof(XMLHttpRequest);

    server.respond();
  });

  it("should make GET queries with no service", (done) => {
    server.respondWith(
      "GET",
      `${mapServiceUrl}0/query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&f=json`,
      JSON.stringify(sampleMapServiceQueryResponse),
    );

    const queryTask = new L.esri.Query({ url: `${mapServiceUrl}0` });

    queryTask.where("1=1").run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleMapServiceCollection);
      expect(raw).to.deep.equal(sampleMapServiceQueryResponse);
      done();
    });

    server.respond();
  });

  it("query tasks without services should make GET requests w/ JSONP", (done) => {
    const queryTask = new L.esri.Query({ url: `${mapServiceUrl}0` });
    queryTask.options.useCors = false;

    const request = queryTask
      .where("1=1")
      .run((error, featureCollection, raw) => {
        expect(featureCollection).to.deep.equal(sampleMapServiceCollection);
        expect(raw).to.deep.equal(sampleMapServiceQueryResponse);
        done();
      });

    window._EsriLeafletCallbacks[request.id](sampleMapServiceQueryResponse);
  });

  it("query tasks without services should make POST requests", (done) => {
    server.respondWith(
      "POST",
      `${mapServiceUrl}0/query`,
      JSON.stringify(sampleMapServiceQueryResponse),
    );
    const queryTask = new L.esri.Query({ url: `${mapServiceUrl}0` });
    queryTask.where(dumbLongQuery).run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleMapServiceCollection);
      expect(raw).to.deep.equal(sampleMapServiceQueryResponse);
      done();
    });

    server.respond();
  });

  it("query tasks should pass through arbitrary parameters when POSTing too", (done) => {
    server.respondWith(
      "POST",
      `${mapServiceUrl}0/query`,
      JSON.stringify(sampleMapServiceQueryResponse),
    );
    const queryTask = new L.esri.Query({
      url: `${mapServiceUrl}0`,
      requestParams: {
        foo: "bar",
      },
    });
    queryTask.where(dumbLongQuery);

    const request = queryTask.run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleMapServiceCollection);
      expect(raw).to.deep.equal(sampleMapServiceQueryResponse);
      done();
    });

    expect(request.requestBody).to.contain("foo=bar");
    server.respond();
  });

  it("should query GeoJSON from ArcGIS Online", (done) => {
    task = L.esri.query({
      url: "http://services.arcgis.com/mock/arcgis/rest/services/MockFeatureService/FeatureServer/0/",
    });

    server.respondWith(
      "GET",
      "http://services.arcgis.com/mock/arcgis/rest/services/MockFeatureService/FeatureServer/0/query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&f=geojson",
      JSON.stringify(sampleFeatureCollection),
    );

    const request = task.run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleFeatureCollection);
      done();
    });

    expect(request).to.be.an.instanceof(XMLHttpRequest);

    server.respond();
  });

  it("should not ask for GeoJSON from utility.arcgis.com", (done) => {
    task = L.esri.query({
      url: "http://utility.arcgis.com/mock/arcgis/rest/services/MockFeatureService/FeatureServer/0/",
    });

    server.respondWith(
      "GET",
      "http://utility.arcgis.com/mock/arcgis/rest/services/MockFeatureService/FeatureServer/0/query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&f=json",
      JSON.stringify(sampleMapServiceQueryResponse),
    );

    const request = task.run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleMapServiceCollection);
      expect(raw).to.deep.equal(sampleMapServiceQueryResponse);
      done();
    });

    expect(request).to.be.an.instanceof(XMLHttpRequest);

    server.respond();
  });

  it("should pass through arbitrary request parameters", (done) => {
    task = L.esri.query({
      url: "http://services.arcgis.com/mock/arcgis/rest/services/MockFeatureService/FeatureServer/0",
      requestParams: {
        foo: "bar",
      },
    });

    server.respondWith(
      "GET",
      "http://services.arcgis.com/mock/arcgis/rest/services/MockFeatureService/FeatureServer/0/query?returnGeometry=true&where=1%3D1&outSR=4326&outFields=*&f=geojson&foo=bar",
      JSON.stringify(sampleFeatureCollection),
    );

    const request = task.run((error, featureCollection, raw) => {
      expect(featureCollection).to.deep.equal(sampleFeatureCollection);
      expect(raw).to.deep.equal(sampleFeatureCollection);
      done();
    });

    expect(request).to.be.an.instanceof(XMLHttpRequest);

    server.respond();
  });
});
