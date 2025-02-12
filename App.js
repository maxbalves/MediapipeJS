import React, { useState, useRef } from 'react';
import { Platform, StyleSheet, Text, View, Button } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission, useSkiaFrameProcessor, VisionCameraProxy } from 'react-native-vision-camera';
import { Skia, PaintStyle, matchFont } from '@shopify/react-native-skia';
import { computeAngles, computeLandmarks } from './PoseDetection';
import { drawLandmarkLine } from './DisplayDetection';
import { pushup } from './exercises';

// TODO: Skia Draw the current Rep Number

// Initialize Frame Processor Plugin
const plugin = VisionCameraProxy.initFrameProcessorPlugin('poseFrameProcessor', {});

// Define dictionaries of landmarks and angles
let landmarks_dict = {};
let angles_dict = {};

// Debug variables
const DISPLAY_ANGLES = true;

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

  // State to control landmark and angle visibility
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showAngles, setShowAngles] = useState(true);
  
  // Use useRef for rep count and stage to persist the values without triggering re-renders
  const repCountRef = useRef(0);
  const stageRef = useRef("up");
  let repetitions = 0;

  // Set color of joints and skeleton 
  const paint = Skia.Paint();
  paint.setStyle(PaintStyle.Fill);
  paint.setStrokeWidth(2);
  paint.setColor(Skia.Color('red'));

  // Set font for Skia text
  const fontFamily = Platform.select({ ios: "Helvetica", default: "serif" });
  const fontStyle = {
    fontFamily,
    fontSize: 54, // Increased font size
    fontStyle: "normal",
    fontWeight: "bold",
  };
  const font = matchFont(fontStyle);

  // Frame Processor Logic
  const frameProcessor = useSkiaFrameProcessor((frame) => {
    'worklet';
    const data = poseFrameProcessor(frame);

    // Compute dictionary of landmarks and angles
    landmarks_dict = computeLandmarks(data);
    angles_dict = computeAngles(landmarks_dict);

    frame.render();
    const frameWidth = frame.width;
    const frameHeight = frame.height;

    // Call pushup function and pass in the setRepCount callback
	// stageRef, repCountRef = pushup(angles_dict, stageRef, repCountRef);
	pushup(angles_dict, stageRef, repCountRef);
	let rep = repCountRef.current;
	repetitions = rep;
	let stage = stageRef.current;
	console.log("CURRENT REP: " + rep);
	console.log("STAGE: " + stage);
	// console.log("/ STAGE: " + stageRef.current);
	// console.log("/ CURRENT REP: " + repCountRef.current);
    // stageRef.current = pushup(angles_dict, stageRef.current, (newRepCount) => {
    // 	repCountRef.current = newRepCount;
    // });

    // Draw circles (landmarks)
    if (showLandmarks) {
      for (const mark of data || []) {
        frame.drawCircle(
          mark.x * Number(frameWidth),
          mark.y * Number(frameHeight),
          6,
          paint,
        );
      }
    }

    // Draw skeleton
    if (showLandmarks) {
      drawLandmarkLine(frame, landmarks_dict, "left_wrist", "left_elbow");
      drawLandmarkLine(frame, landmarks_dict, "left_elbow", "left_shoulder");
      drawLandmarkLine(frame, landmarks_dict, "left_shoulder", "left_hip");
      drawLandmarkLine(frame, landmarks_dict, "left_hip", "left_knee");
      drawLandmarkLine(frame, landmarks_dict, "left_knee", "left_ankle");
      drawLandmarkLine(frame, landmarks_dict, "left_shoulder", "right_shoulder");
      drawLandmarkLine(frame, landmarks_dict, "left_hip", "right_hip");
      drawLandmarkLine(frame, landmarks_dict, "right_shoulder", "right_hip");
      drawLandmarkLine(frame, landmarks_dict, "right_shoulder", "right_elbow");
      drawLandmarkLine(frame, landmarks_dict, "right_elbow", "right_wrist");
      drawLandmarkLine(frame, landmarks_dict, "right_hip", "right_knee");
      drawLandmarkLine(frame, landmarks_dict, "right_knee", "right_ankle");
    }

    // Draw angles
    if (showAngles) {
      for (const [landmark, angle] of Object.entries(angles_dict)) {
        if (angle == undefined || angle < 0 || angle > 360)
          continue;
        let x = landmarks_dict[landmark]['x'] * Number(frameWidth);
        let y = landmarks_dict[landmark]['y'] * Number(frameHeight);
        let text = parseInt(angle) + "°";
        let paint = Skia.Paint();
        paint.setColor(Skia.Color('white'));

        frame.drawText(text, x, y, paint, font);
      }
    }
  }, [showLandmarks, showAngles]); // Add showLandmarks and showAngles as dependencies

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        frameProcessor={frameProcessor}
        pixelFormat='rgb'
        enableFpsGraph={true}
      />
      <View style={styles.repCounterContainer}>
        <Text style={styles.repCounterText}>Reps: {repetitions}</Text> 
      </View>
      <View style={styles.anglesButtonContainer}>
        <Button
          title={showAngles ? "Hide Angles" : "Show Angles"}
          onPress={() => setShowAngles(!showAngles)}
        />
      </View>
      <View style={styles.landmarksButtonContainer}>
        <Button
          title={showLandmarks ? "Hide Landmarks" : "Show Landmarks"}
          onPress={() => setShowLandmarks(!showLandmarks)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  repCounterContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 5,
  },
  repCounterText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  anglesButtonContainer: {
    position: 'absolute',
    bottom: 80, // Higher bottom value to place above the landmarks button
  },
  landmarksButtonContainer: {
    position: 'absolute',
    bottom: 20, // Lower bottom value to place below the angles button
  },
});
