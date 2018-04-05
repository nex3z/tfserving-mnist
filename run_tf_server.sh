#!/bin/bash
tensorflow_model_server --port=9000 --model_name=mnist --model_base_path=$(pwd)/export
