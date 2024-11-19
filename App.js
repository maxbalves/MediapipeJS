import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraFormat, useCameraPermission, useSkiaFrameProcessor, VisionCameraProxy } from 'react-native-vision-camera';
import { useFrameProcessor } from 'react-native-vision-camera';
import { Skia, PaintStyle } from '@shopify/react-native-skia';

const plugin = VisionCameraProxy.initFrameProcessorPlugin('poseFrameProcessor', {});

export function poseFrameProcessor(frame) {
  'worklet';
  if (plugin == null) {
    throw new Error('Failed to load Frame Processor Plugin!');
  }
  return plugin.call(frame);
}

export default function App() {
  const device = useCameraDevice('front');
  const { hasPermission } = useCameraPermission();

  const paint = Skia.Paint();
  paint.setStyle(PaintStyle.Fill);
  paint.setStrokeWidth(2);
  paint.setColor(Skia.Color('red'));

  const frameProcessor = useSkiaFrameProcessor((frame) => {
    'worklet'
    const data = poseFrameProcessor(frame);

    frame.render()
    const frameWidth = frame.width;
    const frameHeight = frame.height;

    // Draw circles
    for (const mark of data || []) {
      frame.drawCircle(
        mark.x * Number(frameWidth),
        mark.y * Number(frameHeight),
        6,
        paint,
      );
    }
  }, []);

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
      pixelFormat='rgb'
    />
  );
}
