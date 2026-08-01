import React from 'react';
import {StyleSheet, View, Text, Dimensions, ScrollView} from 'react-native';
import MapView, {Marker} from 'react-native-maps';

const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class StaticMap extends React.Component<any, any> {
  constructor(props: any) {
    super(props);

    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollview}>
          <Text>Clicking</Text>
          <Text>and</Text>
          <Text>dragging</Text>
          <Text>the</Text>
          <Text>map</Text>
          <Text>will</Text>
          <Text>cause</Text>
          <Text>the</Text>
          <View style={styles.map}>
            <MapView
              provider={this.props.provider}
              style={StyleSheet.absoluteFill}
              scrollEnabled={false}
              zoomEnabled={false}
              pitchEnabled={false}
              rotateEnabled={false}
              initialRegion={this.state.region}>
              <Marker
                title="This is a title"
                description="This is a description"
                coordinate={this.state.region}
              />
            </MapView>
          </View>
          <Text>parent</Text>
          <Text>ScrollView</Text>
          <Text>to</Text>
          <Text>scroll.</Text>
          <Text>When</Text>
          <Text>using</Text>
          <Text>a Google</Text>
          <Text>Map</Text>
          <Text>this only</Text>
          <Text>works</Text>
          <Text>if you</Text>
          <Text>disable:</Text>
          <Text>scroll,</Text>
          <Text>zoom,</Text>
          <Text>pitch,</Text>
          <Text>rotate.</Text>
          <Text>...</Text>
          <Text>It</Text>
          <Text>would</Text>
          <Text>be</Text>
          <Text>nice</Text>
          <Text>to</Text>
          <Text>have</Text>
          <Text>an</Text>
          <Text>option</Text>
          <Text>that</Text>
          <Text>still</Text>
          <Text>allows</Text>
          <Text>zooming.</Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
  },
  scroll: {
    flex: 1,
  },
  scrollview: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  map: {
    width: 250,
    height: 250,
  },
});

export default StaticMap;
