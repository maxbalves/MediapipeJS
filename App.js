import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, VisionCameraProxy } from 'react-native-vision-camera';
import { useFrameProcessor } from 'react-native-vision-camera';

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

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    const data = poseFrameProcessor(frame);
    console.log(data);
  }, []);

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
      fps={30}
      pixelFormat='rgb'
    />
  );
}
