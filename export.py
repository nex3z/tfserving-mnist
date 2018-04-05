from argparse import ArgumentParser
import os
import tensorflow as tf


def main():
    parser = build_parser()
    options = parser.parse_args()
    convert(options)


def convert(options):
    checkpoint = tf.train.latest_checkpoint(options.model_dir)
    meta = checkpoint + ".meta"
    print("Loading %s" % meta)
    saver = tf.train.import_meta_graph(meta)
    with tf.Session() as sess:
        print("Restoring %s" % checkpoint)
        saver.restore(sess, checkpoint)

        x = tf.get_default_graph().get_tensor_by_name("x:0")
        y = tf.get_default_graph().get_tensor_by_name("y:0")
        x_info = tf.saved_model.utils.build_tensor_info(x)
        y_info = tf.saved_model.utils.build_tensor_info(y)
        prediction_signature = (
            tf.saved_model.signature_def_utils.build_signature_def(
                inputs={'images': x_info},
                outputs={'scores': y_info},
                method_name=tf.saved_model.signature_constants.PREDICT_METHOD_NAME))
        legacy_init_op = tf.group(tf.tables_initializer(), name='legacy_init_op')

        export_path = os.path.join(options.export_dir, options.version)
        builder = tf.saved_model.builder.SavedModelBuilder(export_path)
        builder.add_meta_graph_and_variables(
            sess, [tf.saved_model.tag_constants.SERVING],
            signature_def_map={'predict_image': prediction_signature},
            legacy_init_op=legacy_init_op)
        builder.save()
        print("Export complete.")


def build_parser():
    parser = ArgumentParser()
    parser.add_argument('--model_dir', dest='model_dir', default='./saved_model',
                        help='directory where checkpoints are saved')
    parser.add_argument('--version', dest='version', default='1',
                        help='model version')
    parser.add_argument('--export_dir', dest='export_dir', default='./export',
                        help='directory where converted model is exported')
    return parser


if __name__ == '__main__':
    main()
