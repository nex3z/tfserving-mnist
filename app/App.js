/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Container, Header, Body, Title, Content, Grid, Col, Button, Text } from 'native-base';

import FingerPaint from './FignerPaint.js';
import ViewShot from 'react-native-view-shot';
import { captureRef } from 'react-native-view-shot';

const config = require('./config');
const URL = config.rest_server + '/predict';

const IMAGE_SIZE = 28;

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      predict: '--',
      probability: '--'
    }
  }

  render() {
    return (
      <Container>
        <Header>
          <Body>
            <Title>TfServing MNIST</Title>
          </Body>
        </Header>
        <Content>
          <Grid style={styles.resultContainer}>
            <Col>
              <Text style={styles.textTitle}>Prediction</Text>
              <Text style={styles.textContent}>{this.state.predict}</Text>
            </Col>
            <Col>
              <Text style={styles.textTitle}>Probability</Text>
              <Text style={styles.textContent}>{this.state.probability}</Text>
            </Col>
          </Grid>
          <FingerPaint ref='fingerPaint' height={240} width={240}/>
          <Grid style={styles.buttonContainer}>
            <Col>
              <Button block style={styles.button} onPress={() => this.predict()}>
                <Text>Predict</Text>
              </Button>
            </Col>
            <Col>
              <Button block style={styles.button} onPress={() => this.clear()}>
                <Text>Clear</Text>
              </Button>
            </Col>
          </Grid>
        </Content>
      </Container>
    );
  }

  clear = () => {
    this.refs.fingerPaint.clear();
    this.setState({
      predict: '--',
      probability: '--'
    });
  };

  predict = () => {
    this.refs.fingerPaint
      .capture(IMAGE_SIZE, IMAGE_SIZE)
      .then(this.upload)
      .then(response => response.json())
      .then(responseJson => responseJson.result)
      .then(this.renderPredict)
      .catch(error => console.log(error));
  };

  upload = (encode) => {
    return fetch(URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: encode,
      }),
    })
  }

  renderPredict = (result) => {
    let max = -1;
    let idx = -1;
    result.forEach((element, i) => {
      if (element > max) {
        max = element;
        idx = i
      }
    });
    this.setState({
      predict: idx,
      probability: max.toFixed(6)
    });
  };
}

const styles = StyleSheet.create({
  resultContainer: {
    margin: 16
  },
  textTitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#424242'
  },
  textContent: {
    fontSize: 18,
    textAlign: 'center',
    color: '#212121'
  },
  buttonContainer: {
    margin: 8
  },
  button: {
    margin: 8
  },
});
