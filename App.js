import { StyleSheet, Text, View } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { useFrameProcessor } from 'react-native-vision-camera';

export default function App() {
  const device = useCameraDevice('front')
  const { hasPermission } = useCameraPermission()

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet'
    console.log(`Frame: ${frame.width} x ${frame.height} (${frame.pixelFormat})`)
  }, [])

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      frameProcessor={frameProcessor}
    />
  );
}
