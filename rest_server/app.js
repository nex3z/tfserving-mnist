const express = require('express');
const bodyParser = require('body-parser');
const grpc = require('grpc');
const config = require('./config');
const PNG = require('pngjs').PNG;

const PORT = 3000;
const PROTO_ROOT = './proto';
const PROTO_FILE = '/tensorflow_serving/apis/prediction_service.proto';

const tfServing = grpc.load({root: PROTO_ROOT, file: PROTO_FILE}).tensorflow.serving;
const client = new tfServing.PredictionService(config.tf_server, grpc.credentials.createInsecure());

const app = express();
app.use(bodyParser.json());

app.post('/predict', (req, res, next) =>{
  const encode = req.body.image;
  decode(encode, (error, image) => {
    if (error) {
      console.error(`predict: error = ${error}`);
      next(error);
      return;
    }
    client.predict(buildMessage(image), (error, resp) => {
      if (error) {
        console.log(`predict: error = ${error}`);
        next(error);
      } else {
        // console.log(`predict: resp = ${JSON.stringify(resp, null, 2)}`);
        const ret = { "result": resp.outputs.scores.float_val }
        res.json(ret);
      }
    });
  });
});

function decode(encode, callback) {
  const buffer = Buffer.from(encode, 'base64');
  new PNG({ filterType:4 }).parse(buffer, function(error, data) {
    if (error) {
      callback(error)
    } else {
      const image = convert(data.data, data.height, data.width)
      callback(null, image);
    }
  });
}

function convert(data, height, width) {
  const converted = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      const greyScale = (data[idx] + data[idx + 1] + data[idx + 2]) / 3.0
      converted.push((255.0 - greyScale) / 255.0);
    }
  }
  return converted;
}

function buildMessage(image) {
  return {
    model_spec: {
      name: "mnist",
      signature_name: "predict_image"
    },
    inputs: {
      images: {
        dtype: "DT_FLOAT",
        tensor_shape: {
          dim: [{size: 1}, {size: 28}, {size: 28}, {size: 1}],
          unknown_rank: false
        },
        float_val: image
      }
    }
  };
}

app.listen(PORT, () => console.log('Listening on port 3000...'));

module.exports = app;