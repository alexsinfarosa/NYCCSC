// var Acetate_terrain = L.tileLayer('http://a{s}.acetate.geoiq.com/tiles/terrain/{z}/{x}/{y}.png', {
//   attribution: '&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
//   subdomains: '0123',
//   minZoom: 2,
//   maxZoom: 18
// });

import React, { Component } from "react";
import ReactDOM from "react-dom";
import L from "leaflet";

const position = [43, -76];

export default class MiniMap extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      title: ""
    };
    console.log(this.props);
  }

  updateSid() {
    const sid = this.props.sid;
    const isPoint = this.props.geomType === "stn";
    this.layer.setStyle(
      f =>
        isPoint
          ? {
              fillColor: f.id === sid ? "blue" : "black",
              opacity: 0.0,
              fillOpacity: 0.5,
              color: "black"
            }
          : {
              fillColor: f.id === sid ? "blue" : "lightgrey",
              weight: 1.5,
              opacity: 0.6,
              fillOpacity: 0.4,
              color: "black"
            }
    );
    this.layer.eachLayer(l => {
      if (l.feature.id === sid) {
        l.bringToFront();
      }
    });
  }

  updateLayer() {
    const sid = this.props.sid;
    if (this.layer && this.map.hasLayer(this.layer)) {
      this.map.removeLayer(this.layer);
    }
    this.geomType = this.props.geomType;
    const isPoint = this.geomType === "stn";
    const fl = (this.layer = L.geoJson(this.props.geoJSON, {
      pointToLayer: (geojson, latlng) =>
        new L.CircleMarker(latlng, {
          radius: 5,
          fillColor: "darkgrey",
          fillOpacity: 1.0,
          stroke: false,
          fill: true
        }),
      filter: f => true,
      style: f =>
        isPoint
          ? {
              fillColor: f.id === sid ? "blue" : "black",
              opacity: 0.0,
              fillOpacity: 0.5,
              color: "black"
            }
          : {
              fillColor: f.id === sid ? "blue" : "lightgrey",
              weight: 1.5,
              opacity: 0.6,
              fillOpacity: 0.4,
              color: "black"
            }
    }));

    fl.on("mouseover", e => {
      this.setState({ title: e.layer.feature.properties.name });
    });
    fl.on("mouseout", e => {
      this.setState({ title: "" });
    });
    fl.on("click", e => {
      this.props.update(e.layer.feature.id, "");
    });
    fl.addTo(this.map);
  }

  componentDidMount() {
    this.map = L.map(ReactDOM.findDOMNode(this.refs.map), {
      center: position,
      zoom: 5.4
    });
    L.tileLayer(
      "https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png",
      { subdomains: "abcd", minZoom: 5.4, maxZoom: 10, opacity: 0.3 }
    ).addTo(this.map);
    if (this.props.geoJSON) {
      this.updateLayer();
      this.updateSid();
    }
  }

  componentWillUnmount() {
    this.map.removeEventListener();
    this.map = null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.geoJSON && this.geomType !== this.props.geomType) {
      this.updateLayer();
      this.updateSid();
    } else {
      if (prevProps.sid !== this.props.sid) this.updateSid();
    }
  }

  render() {
    const title = this.state.title;
    return (
      <div style={{ width: "100%", height: "100%" }}>
        <div>{title}</div>
        <div ref="map" style={{ width: "100%", height: "100%" }} />
      </div>
    );
  }
}
