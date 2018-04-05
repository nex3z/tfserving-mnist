import React, { Component } from 'react';
import { StyleSheet, View, Text, ART, PixelRatio } from 'react-native';
import ViewShot from "react-native-view-shot";
import { captureRef } from "react-native-view-shot";

const { Surface, Shape, Path } = ART;

export default class FingerPaint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      path: null
    }
  }

  render() {
    return(
      <View style={styles.canvasContainer}
        onStartShouldSetResponder={(evt) => true}
        onResponderGrant={(evt) => this.onTouchEvent('ACTION_DOWN', evt)}
        onResponderMove={(evt) => this.onTouchEvent('ACTION_MOVE', evt)}>
        <ViewShot ref="viewShot">
          <Surface width={this.props.width} height={this.props.height} 
                   style={styles.surface}>
            <Shape width={this.props.width} height={this.props.height} 
                   d={this.state.path} stroke={'black'} strokeWidth={24} />
          </Surface>
        </ViewShot>
      </View>
    );
  }

  points = [];
  onTouchEvent = (action, evt) => {
    const x = evt.nativeEvent.locationX;
    const y = evt.nativeEvent.locationY;
    if (action == 'ACTION_DOWN') {
      this.points.push({action: 'ACTION_DOWN', x: x, y: y})
    } else if (action == 'ACTION_MOVE') {
      this.points.push({action: 'ACTION_MOVE', x: x, y: y})
    }
    const path = this.buildPath(this.points);
    this.setState({path: path});
  };

  buildPath = (points) => {
    const path = new Path();
    for (point of this.points) {
      if (point.action == 'ACTION_DOWN') {
        path.moveTo(point.x, point.y);
      } else if (point.action == 'ACTION_MOVE') {
        path.lineTo(point.x, point.y);
      }
    }
    return path;
  };

  clear = () => {
    this.points = [];
    this.setState({path: null});
  };

  capture = (height, width) => {
    return captureRef(this.refs.viewShot, {
      width: width / PixelRatio.get(),
      height: height / PixelRatio.get(),
      format: "png",
      result: "base64"
    })
  };

}

const styles = StyleSheet.create({
  canvasContainer: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: 'black',
  },
  surface: {
    backgroundColor: 'white'
  }
});